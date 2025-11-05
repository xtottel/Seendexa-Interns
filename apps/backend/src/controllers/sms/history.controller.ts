// controllers/sms/history.controller.ts
import { prisma } from "@/utils/prisma";

export const getSmsHistory = async ({ query, set }: any) => {
  try {
    const { 
      search,
      status = 'all',
      type = 'all',
      page = 1,
      limit = 15
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status !== 'all') {
      where.status = status;
    }

    if (type !== 'all') {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { recipient: { contains: search, mode: 'insensitive' } },
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

    // Get SMS messages with pagination
    const [smsMessages, total] = await Promise.all([
      prisma.smsMessage.findMany({
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.smsMessage.count({ where })
    ]);

    // Format response
    const formattedMessages = smsMessages.map(message => ({
      id: message.id,
      recipient: message.recipient,
      message: message.message,
      type: message.type,
      status: message.status,
      cost: message.cost,
      senderId: message.sender?.name || 'N/A',
      business: {
        id: message.business.id,
        name: message.business.name,
        email: message.business.email
      },
      messageId: message.messageId,
      externalId: message.externalId,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      parentSmsId: message.parentSmsId,
      resentAt: message.resentAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    }));

    set.status = 200;
    return {
      success: true,
      data: formattedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error("Get SMS History Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch SMS history",
      error: error.message 
    };
  }
};

export const getSmsStats = async ({ set }: any) => {
  try {
    const [
      totalMessages,
      deliveredMessages,
      failedMessages,
      pendingMessages,
      totalCostResult
    ] = await Promise.all([
      prisma.smsMessage.count(),
      prisma.smsMessage.count({
        where: {
          OR: [
            { status: 'delivered' },
            { status: 'resent_delivered' }
          ]
        }
      }),
      prisma.smsMessage.count({
        where: {
          status: 'failed'
        }
      }),
      prisma.smsMessage.count({
        where: {
          status: 'pending'
        }
      }),
      prisma.smsMessage.aggregate({
        _sum: {
          cost: true
        }
      })
    ]);

    // Get type distribution
    const typeDistribution = await prisma.smsMessage.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    // Get status distribution
    const statusDistribution = await prisma.smsMessage.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get recent activity (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentActivity = await prisma.smsMessage.count({
      where: {
        createdAt: {
          gte: lastWeek
        }
      }
    });

    set.status = 200;
    return {
      success: true,
      data: {
        total: totalMessages,
        delivered: deliveredMessages,
        failed: failedMessages,
        pending: pendingMessages,
        totalCost: totalCostResult._sum.cost || 0,
        recentActivity,
        typeDistribution: typeDistribution.reduce((acc: any, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {}),
        statusDistribution: statusDistribution.reduce((acc: any, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {})
      }
    };
  } catch (error: any) {
    console.error("Get SMS Stats Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch SMS stats",
      error: error.message 
    };
  }
};