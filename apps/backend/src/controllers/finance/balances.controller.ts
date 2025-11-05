// controllers/finance/balances.controller.ts
import { prisma } from "@/utils/prisma";

export const getClientBalances = async ({ query, set }: any) => {
  try {
    const { 
      search,
      status = 'all',
      balance = 'all',
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get businesses with their accounts
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          accounts: true,
          credits: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.business.count({ where })
    ]);

    // Calculate total spent for each business
    const businessesWithSpent = await Promise.all(
      businesses.map(async (business) => {
        const totalSpentResult = await prisma.creditTransaction.aggregate({
          _sum: {
            amount: true
          },
          where: {
            businessId: business.id,
            type: 'purchase',
            amount: { gt: 0 }
          }
        });

        return {
          ...business,
          totalSpent: totalSpentResult._sum.amount || 0
        };
      })
    );

    // Format response with balance calculations
    const formattedClients = businessesWithSpent.map(business => {
      const walletAccount = business.accounts.find(acc => acc.type === 'WALLET');
      const smsAccount = business.accounts.find(acc => acc.type === 'SMS');
      const lastTransaction = business.credits[0];

      // Calculate monthly usage (last 30 days)
      const monthlyUsage = 0; // Can be calculated similarly if needed

      // Determine balance status
      const walletBalance = walletAccount?.balance || 0;
      const smsCredits = smsAccount?.balance || 0;
      const lowBalanceAlert = walletBalance < 100 || smsCredits < 500;

      return {
        id: business.id,
        clientName: business.name,
        email: business.email,
        walletBalance,
        smsCredits,
        totalSpent: business.totalSpent,
        monthlyUsage,
        status: business.isActive ? 'active' : 'inactive',
        lastTransaction: lastTransaction?.createdAt || business.updatedAt,
        lowBalanceAlert
      };
    });

    // Apply balance filter
    let filteredClients = formattedClients;
    if (balance !== 'all') {
      filteredClients = formattedClients.filter(client => {
        const isLow = client.walletBalance < 100 || client.smsCredits < 500;
        const isHigh = client.walletBalance > 5000 || client.smsCredits > 10000;
        
        if (balance === 'low') return isLow;
        if (balance === 'high') return isHigh;
        if (balance === 'normal') return !isLow && !isHigh;
        return true;
      });
    }

    set.status = 200;
    return {
      success: true,
      data: filteredClients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredClients.length,
        pages: Math.ceil(filteredClients.length / limit)
      }
    };
  } catch (error: any) {
    console.error("Get Client Balances Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch client balances",
      error: error.message 
    };
  }
};

export const getBalanceStats = async ({ set }: any) => {
  try {
    const [
      totalClients,
      activeClients,
      totalWalletBalanceResult,
      totalSmsCreditsResult
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({
        where: {
          isActive: true
        }
      }),
      prisma.businessAccount.aggregate({
        _sum: {
          balance: true
        },
        where: {
          type: 'WALLET'
        }
      }),
      prisma.businessAccount.aggregate({
        _sum: {
          balance: true
        },
        where: {
          type: 'SMS'
        }
      })
    ]);

    // Count low balance clients
    const allBusinesses = await prisma.business.findMany({
      include: {
        accounts: true
      }
    });

    const lowBalanceClients = allBusinesses.filter(business => {
      const walletAccount = business.accounts.find(acc => acc.type === 'WALLET');
      const smsAccount = business.accounts.find(acc => acc.type === 'SMS');
      return (walletAccount?.balance || 0) < 100 || (smsAccount?.balance || 0) < 500;
    }).length;

    set.status = 200;
    return {
      success: true,
      data: {
        totalClients,
        activeClients,
        totalWalletBalance: totalWalletBalanceResult._sum.balance || 0,
        totalSmsCredits: totalSmsCreditsResult._sum.balance || 0,
        lowBalanceClients
      }
    };
  } catch (error: any) {
    console.error("Get Balance Stats Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch balance stats",
      error: error.message 
    };
  }
};