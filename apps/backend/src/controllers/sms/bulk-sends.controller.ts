// controllers/sms/bulk-sends.controller.ts
import { prisma } from "@/utils/prisma";

export const getBulkSends = async ({ query, set }: any) => {
  try {
    const { 
      search,
      status = 'all',
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { business: { 
            name: { contains: search, mode: 'insensitive' } 
          } 
        },
        { sender: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Get bulk sends with pagination
    const [bulkSends, total] = await Promise.all([
      prisma.bulkSend.findMany({
        where,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          sender: {
            select: {
              name: true
            }
          },
          template: {
            select: {
              name: true
            }
          },
          smsMessages: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.bulkSend.count({ where })
    ]);

    // Format response with calculated stats
    const formattedBulkSends = bulkSends.map(bulkSend => {
      const smsMessages = bulkSend.smsMessages || [];
      const deliveredCount = smsMessages.filter(msg => 
        msg.status === 'delivered' || msg.status === 'resent_delivered'
      ).length;
      const failedCount = smsMessages.filter(msg => msg.status === 'failed').length;
      const pendingCount = smsMessages.filter(msg => msg.status === 'pending').length;

      return {
        id: bulkSend.id,
        business: {
          id: bulkSend.business.id,
          name: bulkSend.business.name,
          email: bulkSend.business.email
        },
        totalRecipients: bulkSend.totalRecipients,
        successfulCount: deliveredCount,
        failedCount,
        pendingCount,
        message: bulkSend.message,
        senderId: bulkSend.sender?.name || 'N/A',
        template: bulkSend.template?.name || 'N/A',
        totalCost: bulkSend.totalCost,
        status: bulkSend.status,
        createdAt: bulkSend.createdAt,
        updatedAt: bulkSend.updatedAt
      };
    });

    set.status = 200;
    return {
      success: true,
      data: formattedBulkSends,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error("Get Bulk Sends Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch bulk sends",
      error: error.message 
    };
  }
};

export const getBulkSendStats = async ({ set }: any) => {
  try {
    const [
      totalBulkSends,
      completedBulkSends,
      processingBulkSends,
      failedBulkSends,
      totalRecipientsResult,
      totalCostResult
    ] = await Promise.all([
      prisma.bulkSend.count(),
      prisma.bulkSend.count({
        where: {
          status: 'COMPLETED'
        }
      }),
      prisma.bulkSend.count({
        where: {
          status: 'PROCESSING'
        }
      }),
      prisma.bulkSend.count({
        where: {
          status: 'FAILED'
        }
      }),
      prisma.bulkSend.aggregate({
        _sum: {
          totalRecipients: true
        }
      }),
      prisma.bulkSend.aggregate({
        _sum: {
          totalCost: true
        }
      })
    ]);

    // Get average success rate
    const allBulkSends = await prisma.bulkSend.findMany({
      include: {
        smsMessages: {
          select: {
            status: true
          }
        }
      }
    });

    let totalSuccessRate = 0;
    let validBulkSends = 0;

    allBulkSends.forEach(bulkSend => {
      const totalMessages = bulkSend.smsMessages.length;
      if (totalMessages > 0) {
        const successfulMessages = bulkSend.smsMessages.filter(msg => 
          msg.status === 'delivered' || msg.status === 'resent_delivered'
        ).length;
        totalSuccessRate += (successfulMessages / totalMessages) * 100;
        validBulkSends++;
      }
    });

    const averageSuccessRate = validBulkSends > 0 ? totalSuccessRate / validBulkSends : 0;

    set.status = 200;
    return {
      success: true,
      data: {
        totalBulkSends,
        completedBulkSends,
        processingBulkSends,
        failedBulkSends,
        totalRecipients: totalRecipientsResult._sum.totalRecipients || 0,
        totalCost: totalCostResult._sum.totalCost || 0,
        averageSuccessRate: Math.round(averageSuccessRate * 100) / 100
      }
    };
  } catch (error: any) {
    console.error("Get Bulk Send Stats Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch bulk send stats",
      error: error.message 
    };
  }
};