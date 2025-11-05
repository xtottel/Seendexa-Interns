// controllers/finance/transactions.controller.ts
import { prisma } from "@/utils/prisma";

export const getTransactions = async ({ query, set }: any) => {
  try {
    const { 
      search,
      type = 'all',
      status = 'all',
      accountType = 'all',
      page = 1,
      limit = 15
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (type !== 'all') {
      where.type = type;
    }

    if (accountType !== 'all') {
      where.account = {
        type: accountType
      };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { business: { 
            name: { contains: search, mode: 'insensitive' } 
          } 
        },
        { referenceId: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        include: {
          business: {
            select: {
              name: true
            }
          },
          account: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.creditTransaction.count({ where })
    ]);

    // Format response
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      transactionId: `TXN-${tx.id.slice(-6).toUpperCase()}`,
      clientName: tx.business.name,
      type: tx.type,
      amount: tx.amount,
      balance: tx.balance,
      description: tx.description,
      accountType: tx.account.type,
      createdAt: tx.createdAt,
      status: 'completed', // Default since schema doesn't have status
      reference: tx.referenceId || `REF-${tx.id.slice(-4).toUpperCase()}`
    }));

    set.status = 200;
    return {
      success: true,
      data: {
        transactions: formattedTransactions,
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

export const getTransactionStats = async ({ set }: any) => {
  try {
    // Get total transactions count
    const totalTransactions = await prisma.creditTransaction.count();

    // Calculate total volume properly - only count monetary transactions (WALLET)
    const walletVolumeResult = await prisma.creditTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        account: {
          type: 'WALLET'
        }
      }
    });

    // Calculate SMS credits volume (absolute sum for SMS account transactions)
    const smsVolumeResult = await prisma.creditTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        account: {
          type: 'SMS'
        }
      }
    });

    // Get completed transactions (all are considered completed in current schema)
    const completedTransactions = totalTransactions;

    // Get type counts
    const typeCounts = await prisma.creditTransaction.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    // Get account type distribution
    const accountTypeCounts = await prisma.creditTransaction.groupBy({
      by: ['accountId'],
      _count: {
        id: true
      },
      where: {
        account: {
          isActive: true
        }
      }
    });

    // Get account types for the counts
    const accountTypes = await prisma.businessAccount.findMany({
      where: {
        id: {
          in: accountTypeCounts.map(item => item.accountId)
        }
      },
      select: {
        id: true,
        type: true
      }
    });

    // Create account type count map
    const accountTypeCountMap: any = {
      WALLET: 0,
      SMS: 0
    };

    accountTypeCounts.forEach(item => {
      const accountType = accountTypes.find(acc => acc.id === item.accountId)?.type;
      if (accountType && accountTypeCountMap[accountType] !== undefined) {
        accountTypeCountMap[accountType] += item._count.id;
      }
    });

    const typeCountMap: any = {};
    typeCounts.forEach(item => {
      typeCountMap[item.type] = item._count.id;
    });

    // Calculate total volume - for monetary value we use absolute wallet transactions
    // For display purposes, we show the monetary volume (wallet transactions)
    const totalVolume = Math.abs(walletVolumeResult._sum.amount || 0);
    const smsCreditsVolume = Math.abs(smsVolumeResult._sum.amount || 0);

    set.status = 200;
    return {
      success: true,
      data: {
        totalTransactions,
        totalVolume, // This is now the monetary volume only
        smsCreditsVolume, // Separate SMS credits volume
        completedTransactions,
        pendingTransactions: 0, // No pending transactions in current schema
        typeCounts: typeCountMap,
        accountTypeCounts: accountTypeCountMap
      }
    };
  } catch (error: any) {
    console.error("Get Transaction Stats Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch transaction stats",
      error: error.message 
    };
  }
};