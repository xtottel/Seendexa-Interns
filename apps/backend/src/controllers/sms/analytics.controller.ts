// controllers/sms/analytics.controller.ts
import { prisma } from "@/utils/prisma";

export const getSmsOverview = async ({ query, set }: any) => {
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

    // Get SMS analytics for the period
    const [totalSent, delivered, failed, totalCost] = await Promise.all([
      prisma.smsMessage.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.smsMessage.count({
        where: {
          OR: [
            { status: 'delivered' },
            { status: 'resent_delivered' }
          ],
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.smsMessage.count({
        where: {
          status: 'failed',
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.smsMessage.aggregate({
        _sum: {
          cost: true
        },
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ]);

    // Get previous period for comparison
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);

    const [previousSent, previousDelivered] = await Promise.all([
      prisma.smsMessage.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate
          }
        }
      }),
      prisma.smsMessage.count({
        where: {
          OR: [
            { status: 'delivered' },
            { status: 'resent_delivered' }
          ],
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate
          }
        }
      })
    ]);

    // Calculate growth percentages
    const sentGrowth = previousSent > 0 
      ? Math.round(((totalSent - previousSent) / previousSent) * 100)
      : 0;
    
    const deliveredGrowth = previousDelivered > 0 
      ? Math.round(((delivered - previousDelivered) / previousDelivered) * 100)
      : 0;

    // Calculate delivery rate
    const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0;

    set.status = 200;
    return {
      success: true,
      data: {
        totalSent,
        delivered,
        failed,
        pending: totalSent - delivered - failed,
        deliveryRate,
        totalCost: totalCost._sum.cost || 0,
        sentGrowth,
        deliveredGrowth
      }
    };
  } catch (error: any) {
    console.error("Get SMS Overview Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch SMS overview",
      error: error.message 
    };
  }
};

export const getNetworkDistribution = async ({ query, set }: any) => {
  try {
    const { range = 'month' } = query;

    // Calculate date range
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

    // Get all SMS messages in the period
    const smsMessages = await prisma.smsMessage.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        recipient: true,
        status: true
      }
    });

    // Analyze network distribution based on phone number prefixes
    const networkDistribution = {
      mtn: 0,
      telecel: 0,
      at: 0,
      other: 0
    };

    smsMessages.forEach(message => {
      const phone = message.recipient.replace(/\D/g, ''); // Remove non-digits
      
      // Ghana mobile number prefixes
      if (phone.startsWith('23324') || phone.startsWith('23354') || phone.startsWith('23355') || 
          phone.startsWith('23359') || phone.startsWith('23325')) {
        networkDistribution.mtn++;
      } else if (phone.startsWith('23320') || phone.startsWith('23350')) {
        networkDistribution.telecel++;
      } else if (phone.startsWith('23327') || phone.startsWith('23357') || phone.startsWith('23326')) {
        networkDistribution.at++;
      } else {
        networkDistribution.other++;
      }
    });

    // Calculate percentages
    const total = smsMessages.length;
    const percentages = {
      mtn: total > 0 ? Math.round((networkDistribution.mtn / total) * 100) : 0,
      telecel: total > 0 ? Math.round((networkDistribution.telecel / total) * 100) : 0,
      at: total > 0 ? Math.round((networkDistribution.at / total) * 100) : 0,
      other: total > 0 ? Math.round((networkDistribution.other / total) * 100) : 0
    };

    set.status = 200;
    return {
      success: true,
      data: {
        counts: networkDistribution,
        percentages,
        total
      }
    };
  } catch (error: any) {
    console.error("Get Network Distribution Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch network distribution",
      error: error.message 
    };
  }
};