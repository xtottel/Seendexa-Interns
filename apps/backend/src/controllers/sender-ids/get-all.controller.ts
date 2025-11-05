// controllers/sender-ids/get-all.controller.ts
import { prisma } from "@/utils/prisma";

export const getAll = async ({ query, set }: any) => {
  try {
    const { status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { business: { 
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          } 
        }
      ];
    }

    // Get sender IDs with pagination
    const [senderIds, total] = await Promise.all([
      prisma.senderId.findMany({
        where,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          smsMessages: {
            select: {
              id: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.senderId.count({ where })
    ]);

    // Format response
    const formattedSenderIds = senderIds.map(senderId => ({
      id: senderId.id,
      name: senderId.name,
      business: senderId.business,
      status: senderId.status,
      createdAt: senderId.createdAt,
      updatedAt: senderId.updatedAt,
      smsCount: senderId.smsMessages.length
    }));

    set.status = 200;
    return {
      success: true,
      data: formattedSenderIds,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error("Get Sender IDs Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch sender IDs",
      error: error.message 
    };
  }
};