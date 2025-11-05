// controllers/clients/update-status.controller.ts
import { prisma } from "@/utils/prisma";

export const updateStatus = async ({ params, body, set }: any) => {
  try {
    const { id } = params;
    const { isActive } = body; // Remove status parameter since it doesn't exist

    const business = await prisma.business.findUnique({
      where: { id }
    });

    if (!business) {
      set.status = 404;
      return { success: false, message: "Client not found" };
    }

    const updateData: any = {
      isActive: isActive !== undefined ? isActive : business.isActive,
      updatedAt: new Date()
    };

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: updateData,
      include: {
        users: {
          include: {
            role: {
              select: { name: true }
            }
          },
          take: 1
        }
      }
    });

    set.status = 200;
    return {
      success: true,
      message: `Client ${isActive ? 'activated' : 'suspended'} successfully`,
      data: {
        id: updatedBusiness.id,
        name: updatedBusiness.name,
        isActive: updatedBusiness.isActive,
        status: updatedBusiness.isActive ? 'active' : 'inactive' // Derived status
      }
    };
  } catch (error: any) {
    console.error("Update Client Status Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to update client status",
      error: error.message 
    };
  }
};