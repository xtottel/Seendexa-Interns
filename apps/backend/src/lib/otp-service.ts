// lib/otp-service.ts
interface RequestOTPParams {
  phone: string;
  from: string;
  message?: string;
  pinLength?: number;
  pinType?: "NUMERIC" | "ALPHANUMERIC" | "ALPHABETIC";
  expiry?: {
    amount: number;
    duration: "minutes" | "hours";
  };
  maxAmountOfValidationRetries?: number;
  metadata?: Record<string, any>;
}

interface OTPResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class OTPService {
  private static readonly API_BASE = "https://api.sendexa.co/v1/otp";
  private static readonly API_KEY = "c21zX2RmZGEwYTYwOjM2YjdjNWNhZDdkOTUxMjQ=";
  private static readonly SENDER_ID = "Sendexa";

  static async sendOTP(phone: string, metadata?: Record<string, any>): Promise<OTPResponse> {
    const payload: RequestOTPParams = {
      phone: this.normalizePhone(phone),
      from: this.SENDER_ID,
      message: "Your verification code is {code}, it expires in {amount} {duration}",
      pinLength: 6,
      pinType: "NUMERIC",
      expiry: {
        amount: 10,
        duration: "minutes"
      },
      maxAmountOfValidationRetries: 3,
      metadata: {
        purpose: "login",
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };

    const response = await fetch(`${this.API_BASE}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }

    return data;
  }

  static async verifyOTP(phone: string, code: string): Promise<OTPResponse> {
    const payload = {
      phone: this.normalizePhone(phone),
      code: code,
    };

    const response = await fetch(`${this.API_BASE}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "OTP verification failed");
    }

    return data;
  }

  static async resendOTP(phone: string): Promise<OTPResponse> {
    const payload = {
      phone: this.normalizePhone(phone),
    };

    const response = await fetch(`${this.API_BASE}/resend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend OTP");
    }

    return data;
  }

  private static normalizePhone(phone: string): string {
    // Remove any non-digit characters
    let normalized = phone.replace(/\D/g, '');
    
    // If starts with 0, convert to 233 (Ghana)
    if (normalized.startsWith('0')) {
      normalized = '233' + normalized.substring(1);
    }
    
    // If doesn't have country code, add 233
    if (!normalized.startsWith('233')) {
      normalized = '233' + normalized;
    }
    
    return normalized;
  }
}