// controllers/finance/overview.controller.ts
import { prisma } from "@/utils/prisma";

export const getFinanceOverview = async ({ query, set }: any) => {
  try {
    const { range = 'month' } = query;

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get total revenue (sum of all purchases)
    const totalRevenueResult = await prisma.creditTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'purchase',
        amount: {
          gt: 0
        }
      }
    });

    // Get monthly revenue (current month purchases)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await prisma.creditTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'purchase',
        amount: {
          gt: 0
        },
        createdAt: {
          gte: currentMonthStart
        }
      }
    });

    // Get previous period revenue for growth calculation
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);

    const previousRevenueResult = await prisma.creditTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'purchase',
        amount: {
          gt: 0
        },
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    // Get active clients count
    const activeClients = await prisma.business.count({
      where: {
        isActive: true
      }
    });

    // Get pending invoices count
    const pendingInvoices = await prisma.invoice.count({
      where: {
        status: 'pending'
      }
    });

    // Get total transactions count
    const totalTransactions = await prisma.creditTransaction.count();

    // Get total wallet balances
    const walletBalancesResult = await prisma.businessAccount.aggregate({
      _sum: {
        balance: true
      },
      where: {
        type: 'WALLET'
      }
    });

    // Get total SMS credits
    const smsCreditsResult = await prisma.businessAccount.aggregate({
      _sum: {
        balance: true
      },
      where: {
        type: 'SMS'
      }
    });

    // Calculate revenue growth
    const currentRevenue = monthlyRevenueResult._sum.amount || 0;
    const previousRevenue = previousRevenueResult._sum.amount || 0;
    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    set.status = 200;
    return {
      success: true,
      data: {
        totalRevenue: totalRevenueResult._sum.amount || 0,
        monthlyRevenue: currentRevenue,
        revenueGrowth,
        activeClients,
        pendingInvoices,
        totalTransactions,
        walletBalances: walletBalancesResult._sum.balance || 0,
        smsCredits: smsCreditsResult._sum.balance || 0
      }
    };
  } catch (error: any) {
    console.error("Get Finance Overview Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch finance overview",
      error: error.message 
    };
  }
};

export const getRecentTransactions = async ({ query, set }: any) => {
  try {
    const { limit = 5 } = query;

    const transactions = await prisma.creditTransaction.findMany({
      include: {
        business: {
          select: {
            name: true
          }
        },
        account: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      clientName: tx.business.name,
      type: tx.type,
      amount: tx.amount,
      date: tx.createdAt.toISOString().split('T')[0],
      status: 'completed'
    }));

    set.status = 200;
    return {
      success: true,
      data: formattedTransactions
    };
  } catch (error: any) {
    console.error("Get Recent Transactions Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch recent transactions",
      error: error.message 
    };
  }
};

export const getTopClients = async ({ query, set }: any) => {
  try {
    const { limit = 5 } = query;

    // Get businesses with their purchase transactions
    const businesses = await prisma.business.findMany({
      where: {
        isActive: true
      },
      include: {
        credits: {
          where: {
            type: 'purchase',
            amount: { gt: 0 }
          }
        }
      },
      take: parseInt(limit)
    });

    // Calculate total spent for each business
    const clientsWithSpent = await Promise.all(
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
          id: business.id,
          name: business.name,
          spent: totalSpentResult._sum.amount || 0,
          growth: Math.floor(Math.random() * 50) - 10 // Placeholder growth
        };
      })
    );

    // Sort by spent amount
    const formattedClients = clientsWithSpent.sort((a, b) => b.spent - a.spent);

    set.status = 200;
    return {
      success: true,
      data: formattedClients
    };
  } catch (error: any) {
    console.error("Get Top Clients Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch top clients",
      error: error.message 
    };
  }
};