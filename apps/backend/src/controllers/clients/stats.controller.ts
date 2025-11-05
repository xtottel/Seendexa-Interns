// controllers/clients/stats.controller.ts
import { prisma } from "@/utils/prisma";

export const getStats = async ({ set }: any) => {
  try {
    const [
      total,
      active,
      inactive,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.business.count({ where: { isActive: false } }),
    ]);

    // Get total balance across all businesses
    const totalBalanceResult = await prisma.businessAccount.aggregate({
      _sum: {
        balance: true
      },
      where: {
        type: 'WALLET'
      }
    });

    // Get total SMS sent
    const totalSmsSent = await prisma.smsMessage.count();

    set.status = 200;
    return {
      success: true,
      data: {
        total,
        active,
        inactive,
        verified: active, // Since there's no status field, use active count as verified
        pending: 0, // No status field, so no pending count
        totalBalance: totalBalanceResult._sum.balance || 0,
        totalSmsSent
      }
    };
  } catch (error: any) {
    console.error("Get Client Stats Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch client stats",
      error: error.message 
    };
  }
};