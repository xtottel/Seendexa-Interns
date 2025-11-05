/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Update your login-form.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { OTPInput } from "@/components/otp-input";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error types with Sonner toasts
        if (data.errorType === "OTP_ALREADY_ACTIVE") {
          toast.error("OTP Already Sent", {
            description:
              "An OTP was recently sent. Please wait or try again shortly.",
          });
        } else if (data.errorType === "SENDER_ID_ERROR") {
          toast.error("Service Unavailable", {
            description:
              "Service temporarily unavailable. Please try again later.",
          });
        } else if (
          data.errorType === "AUTH_CONFIG_ERROR" ||
          data.errorType === "SERVICE_CONFIG_ERROR"
        ) {
          toast.error("Configuration Error", {
            description: "Service configuration error. Please contact support.",
          });
        } else {
          toast.error("Failed to Send OTP", {
            description: data.message || "Failed to send verification code",
          });
        }
        return;
      }

      setStep("otp");
      toast.success("Verification Code Sent", {
        description: "We've sent a 6-digit code to your phone number.",
      });
    } catch (err: any) {
      toast.error("Network Error", {
        description: "Please check your internet connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Invalid Code", {
        description: "Please enter the complete 6-digit code.",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Sending OTP verification request...");
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      console.log("📥 OTP verification response:", {
        status: res.status,
        ok: res.ok,
        data: data,
      });

      if (!res.ok) {
        // ... your existing error handling
        return;
      }

      // ✅ FIX: Save token to COOKIES (for proxy) AND localStorage (for client)
      if (data.token) {
        // Save to localStorage (for client-side use)
        localStorage.setItem("auth_token", data.token);
        sessionStorage.setItem("auth_token", data.token);

        // ✅ CRITICAL: Save to cookies for proxy access
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure=${process.env.NODE_ENV === "production"}; sameSite=lax`;
        document.cookie = `sessionToken=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure=${process.env.NODE_ENV === "production"}; sameSite=lax`;

        console.log("✅ Token saved to cookies and localStorage");
      }

      toast.success("Login Successful", {
        description: "Welcome back! Redirecting to your dashboard...",
      });

      // Get redirect URL from query parameters or default to /home
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirect") || "/home";

      console.log("🔄 Redirecting to:", redirectTo);

      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1500);
    } catch (err: any) {
      console.error("❌ Network error during OTP verification:", err);
      toast.error("Network Error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errorType === "RESEND_COOLDOWN") {
          toast.error("Please Wait", {
            description: "Please wait before requesting a new code.",
          });
        } else {
          toast.error("Resend Failed", {
            description: data.message || "Failed to resend verification code",
          });
        }
        return;
      }

      // Clear previous OTP when resending
      setOtp("");

      toast.success("New Code Sent", {
        description: "We've sent a new verification code to your phone.",
      });
    } catch (err: any) {
      toast.error("Network Error", {
        description: "Failed to resend code. Please try again.",
      });
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login securely with your verified phone number
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleSendOtp}>
              <FieldGroup>
                {/* email */}
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0555539152"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                  />
                  {/* <FieldDescription>
                    Enter your registered phone number
                  </FieldDescription> */}
                </Field>
                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </>
                    ) : (
                      "Login Exahub"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <FieldGroup>
                <Field>
                  <FieldLabel>
                    Enter the 6-digit code sent to {phone}
                  </FieldLabel>
                  {/* <FieldDescription className="text-center mt-4">
                    Enter the 6-digit code sent to {phone}
                  </FieldDescription> */}
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </Field>
                <div className="flex flex-col gap-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading || loading}
                      className="underline underline-offset-4 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendLoading ? "Resending..." : "Resend"}
                    </button>
                  </p>
                  {/* <p className="text-sm text-muted-foreground">
                    Or{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setOtp(""); // Clear OTP when going back
                      }}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      change phone number
                    </button>
                  </p> */}
                </div>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        <p>
          <Lock className="inline mr-1 h-4 w-4" /> Secured by{" "}
          <a href="https://xtottel.com" className="font-medium underline">
            Xtottel Ltd
          </a>
          .
        </p>
      </FieldDescription>
    </div>
  );
}
