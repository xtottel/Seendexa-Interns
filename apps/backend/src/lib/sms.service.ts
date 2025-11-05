// lib/sms.service.ts
export class SMSService {
  private credentials: string;
  private baseUrl = 'https://api.sendexa.co/v1/sms';

  constructor(apiKey: string, apiSecret: string) {
    this.credentials = btoa(`${apiKey}:${apiSecret}`);
  }

  async sendSMS(to: string, from: string, message: string) {
    try {
      // Format Ghana phone number if needed
      const formattedTo = this.formatPhoneNumber(to);

      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.credentials}`
        },
        body: JSON.stringify({ to: formattedTo, from, message })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }
      
      return data;
    } catch (error) {
      console.error('SMS Send Error:', error);
      throw error;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with 0, convert to 233 format
    if (digits.startsWith('0')) {
      return `233${digits.substring(1)}`;
    }
    
    // If it doesn't have country code, add it
    if (digits.length === 9) {
      return `233${digits}`;
    }
    
    return digits;
  }
}

// Create singleton instance
export const smsService = new SMSService(
  process.env.SENDEXA_API_KEY!,
  process.env.SENDEXA_API_SECRET!
);