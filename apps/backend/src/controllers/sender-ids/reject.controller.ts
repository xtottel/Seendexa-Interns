// controllers/sender-ids/reject.controller.ts
import { prisma } from "@/utils/prisma";
import { smsService } from "../../lib/sms.service";

export const reject = async ({ params, set }: any) => {
  try {
    const { id } = params;

    const senderId = await prisma.senderId.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!senderId) {
      set.status = 404;
      return { success: false, message: "Sender ID not found" };
    }

    // Update sender ID status
    const updatedSenderId = await prisma.senderId.update({
      where: { id },
      data: { 
        status: 'rejected',
        updatedAt: new Date()
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Send SMS notification to business about rejection
    try {
      const appName = process.env.APP_NAME || "Our Platform";
      const message = `Dear ${senderId.business.name}, your Sender ID "${senderId.name}" registration was not approved. Please contact support for more information. - ${appName}`;
      
      await smsService.sendSMS(
        senderId.business.phone,
        appName.replace(/\s+/g, '').substring(0, 11),
        message
      );
      
      console.log(`SMS rejection notification sent to ${senderId.business.name}`);
    } catch (smsError) {
      console.error("Failed to send SMS notification:", smsError);
      // Don't throw error, just log it
    }

    set.status = 200;
    return {
      success: true,
      message: "Sender ID rejected successfully",
      data: updatedSenderId
    };
  } catch (error: any) {
    console.error("Reject Sender ID Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to reject sender ID",
      error: error.message 
    };
  }
};