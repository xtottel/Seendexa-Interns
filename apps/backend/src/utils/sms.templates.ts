// utils/sms.templates.ts
export const smsTemplates = {
  senderIdApproved: (businessName: string, senderId: string, appName: string) => 
    `Dear ${businessName}, your Sender ID "${senderId}" has been approved. You can now use it for sending SMS. Thank you for choosing ${appName}.`,

  senderIdRejected: (businessName: string, senderId: string, appName: string) =>
    `Dear ${businessName}, your Sender ID "${senderId}" registration was not approved. Please contact support for more information. - ${appName}`,

  senderIdPending: (businessName: string, senderId: string, appName: string) =>
    `Dear ${businessName}, your Sender ID "${senderId}" registration is being reviewed. We'll notify you once processed. - ${appName}`
};