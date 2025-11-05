// controllers/clients/transactions.controller.ts
import { prisma } from "@/utils/prisma";

// Define types for better TypeScript support
interface BusinessAccount {
  type: string;
  balance: number;
  currency: string;
}

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string | null;
  account: BusinessAccount;
  createdAt: Date;
}

export const getTransactions = async ({ params, query, set }: any) => {
  try {
    const { id } = params;
    const { 
      page = 1, 
      limit = 15 
    } = query;
    
    const skip = (page - 1) * limit;

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!business) {
      set.status = 404;
      return { 
        success: false, 
        message: "Client not found" 
      };
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: {
          businessId: id
        },
        include: {
          account: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.creditTransaction.count({
        where: {
          businessId: id
        }
      })
    ]);

    set.status = 200;
    return {
      success: true,
      data: {
        transactions: (transactions as CreditTransaction[]).map((tx: CreditTransaction) => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          balance: tx.balance,
          description: tx.description,
          accountType: tx.account.type,
          createdAt: tx.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error: any) {
    console.error("Get Transactions Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch transactions",
      error: error.message 
    };
  }
};