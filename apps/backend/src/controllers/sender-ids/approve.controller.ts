// controllers/sender-ids/approve.controller.ts
import { prisma } from "@/utils/prisma";
import { smsService } from "../../lib/sms.service";

export const approve = async ({ params, set }: any) => {
  try {
    const { id } = params;

    const senderId = await prisma.senderId.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!senderId) {
      set.status = 404;
      return { success: false, message: "Sender ID not found" };
    }

    // Update sender ID status
    const updatedSenderId = await prisma.senderId.update({
      where: { id },
      data: {
        status: "approved",
        updatedAt: new Date(),
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send SMS notification to business about approval
    try {
      const appName = process.env.APP_NAME || "Sendexa";
      const message = `Dear ${senderId.business.name}, your Sender ID "${senderId.name}" has been approved. You can now use it for sending SMS. Thank you for choosing ${appName}.`;

      await smsService.sendSMS(
        senderId.business.phone,
        appName.replace(/\s+/g, "").substring(0, 11), // Sender ID max 11 chars
        message
      );

      console.log(`SMS notification sent to ${senderId.business.name}`);
    } catch (smsError) {
      console.error("Failed to send SMS notification:", smsError);
      // Don't throw error, just log it since the main operation succeeded
    }

    set.status = 200;
    return {
      success: true,
      message: "Sender ID approved successfully",
      data: updatedSenderId,
    };
  } catch (error: any) {
    console.error("Approve Sender ID Error:", error);
    set.status = 500;
    return {
      success: false,
      message: "Failed to approve sender ID",
      error: error.message,
    };
  }
};
