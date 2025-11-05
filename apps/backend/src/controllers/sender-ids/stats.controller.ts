// controllers/sender-ids/stats.controller.ts
import { prisma } from "@/utils/prisma";

export const getStats = async ({ set }: any) => {
  try {
    const [
      total,
      approved,
      pending,
      rejected
    ] = await Promise.all([
      prisma.senderId.count(),
      prisma.senderId.count({ where: { status: 'approved' } }),
      prisma.senderId.count({ where: { status: 'pending' } }),
      prisma.senderId.count({ where: { status: 'rejected' } })
    ]);

    set.status = 200;
    return {
      success: true,
      data: {
        total,
        approved,
        pending,
        rejected
      }
    };
  } catch (error: any) {
    console.error("Get Stats Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch stats",
      error: error.message 
    };
  }
};