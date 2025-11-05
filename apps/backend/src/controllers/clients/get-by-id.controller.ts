// controllers/clients/get-by-id.controller.ts
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

export const getById = async ({ params, set }: any) => {
  try {
    const { id } = params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            role: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        accounts: true,
        senderIds: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          }
        },
        settings: true,
        _count: {
          select: {
            users: true,
            smsMessages: true,
            otpMessages: true,
            apiKeys: true,
            webhooks: true,
            senderIds: true,
            templates: true,
            contactGroups: true,
            invoices: true
          }
        }
      }
    });

    if (!business) {
      set.status = 404;
      return { 
        success: false, 
        message: "Client not found" 
      };
    }

    // Get account balances
    const smsAccount = business.accounts.find((acc: BusinessAccount) => acc.type === 'SMS');
    const walletAccount = business.accounts.find((acc: BusinessAccount) => acc.type === 'WALLET');

    // Calculate total spent (sum of all purchases/usage from credit transactions)
    const totalSpentResult = await prisma.creditTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        businessId: id,
        type: {
          in: ['purchase', 'usage']
        },
        amount: {
          lt: 0 // Negative amounts represent spending
        }
      }
    });

    // Calculate monthly usage (spent in current month)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const monthlyUsageResult = await prisma.creditTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        businessId: id,
        type: {
          in: ['purchase', 'usage']
        },
        amount: {
          lt: 0
        },
        createdAt: {
          gte: currentMonthStart
        }
      }
    });

    // Get recent transactions with pagination (15 per page)
    const recentTransactions = await prisma.creditTransaction.findMany({
      where: {
        businessId: id
      },
      include: {
        account: true
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    // Determine status based on isActive since there's no status field
    const status = business.isActive ? 'active' : 'inactive';

    // Format the response
    const formattedClient = {
      id: business.id,
      name: business.name,
      email: business.email,
      phone: business.phone,
      address: business.address,
      businessType: business.businessType,
      businessSector: business.businessSector,
      description: business.description,
      website: business.website,
      isActive: business.isActive,
      status: status, // Use derived status
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
      lastActive: business.users[0]?.lastLogin || business.updatedAt,
      users: business.users.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        createdAt: user.createdAt
      })),
      accounts: business.accounts,
      senderIds: business.senderIds,
      settings: business.settings,
      stats: {
        users: business._count.users,
        smsMessages: business._count.smsMessages,
        otpMessages: business._count.otpMessages,
        apiKeys: business._count.apiKeys,
        webhooks: business._count.webhooks,
        senderIds: business._count.senderIds,
        templates: business._count.templates,
        contactGroups: business._count.contactGroups,
        invoices: business._count.invoices,
        totalSpent: Math.abs(totalSpentResult._sum.amount || 0),
        monthlyUsage: Math.abs(monthlyUsageResult._sum.amount || 0),
        creditBalance: smsAccount?.balance || 0
      },
      recentTransactions: recentTransactions.map((tx: CreditTransaction) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balance: tx.balance,
        description: tx.description,
        accountType: tx.account.type,
        createdAt: tx.createdAt
      }))
    };

    set.status = 200;
    return {
      success: true,
      data: formattedClient
    };
  } catch (error: any) {
    console.error("Get Client by ID Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch client",
      error: error.message 
    };
  }
};