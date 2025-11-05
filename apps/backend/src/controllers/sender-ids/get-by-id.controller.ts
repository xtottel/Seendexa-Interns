// controllers/sender-ids/get-by-id.controller.ts
import { prisma } from "@/utils/prisma";

export const getById = async ({ params, set }: any) => {
  try {
    const { id } = params;

    const senderId = await prisma.senderId.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            businessType: true,
            businessSector: true
          }
        },
        smsMessages: {
          select: {
            id: true,
            status: true,
            cost: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 messages
        },
        _count: {
          select: {
            smsMessages: true,
            OtpMessages: true,
            bulkSends: true
          }
        }
      }
    });

    if (!senderId) {
      set.status = 404;
      return { 
        success: false, 
        message: "Sender ID not found" 
      };
    }

    // Format the response
    const formattedSenderId = {
      id: senderId.id,
      name: senderId.name,
      status: senderId.status,
      createdAt: senderId.createdAt,
      updatedAt: senderId.updatedAt,
      business: senderId.business,
      stats: {
        totalSms: senderId._count.smsMessages,
        totalOtp: senderId._count.OtpMessages,
        totalBulkSends: senderId._count.bulkSends
      },
      recentMessages: senderId.smsMessages
    };

    set.status = 200;
    return {
      success: true,
      data: formattedSenderId
    };
  } catch (error: any) {
    console.error("Get Sender ID by ID Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch sender ID",
      error: error.message 
    };
  }
};