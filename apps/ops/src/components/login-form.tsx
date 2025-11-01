// Update your login-form.tsx with better error handling
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errorType, setErrorType] = useState("")

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setErrorType("")

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        // Handle specific error types
        if (data.errorType === "OTP_ALREADY_ACTIVE") {
          setMessage("An OTP was recently sent. Please wait or try again shortly.")
        } else if (data.errorType === "SENDER_ID_ERROR") {
          setMessage("Service temporarily unavailable. Please try again later.")
        } else {
          setMessage(data.message || "Failed to send OTP")
        }
        setErrorType(data.errorType)
        return
      }
      
      setStep("otp")
      setMessage("Verification code sent successfully!")
    } catch (err: any) {
      setMessage(err.message || "Network error. Please check your connection.")
      setErrorType("NETWORK_ERROR")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setErrorType("")

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        // Handle specific verification errors
        if (data.errorType === "INVALID_OTP") {
          setMessage("Invalid code. Please check and try again.")
        } else if (data.errorType === "EXPIRED_OTP") {
          setMessage("Code has expired. Please request a new one.")
        } else if (data.errorType === "MAX_ATTEMPTS_EXCEEDED") {
          setMessage("Too many attempts. Please request a new code.")
        } else {
          setMessage(data.message || "Verification failed")
        }
        setErrorType(data.errorType)
        return
      }
      
      setMessage("Login successful! Redirecting...")
      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } catch (err: any) {
      setMessage(err.message || "Network error during verification.")
      setErrorType("NETWORK_ERROR")
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOtp() {
    setLoading(true)
    setMessage("")
    setErrorType("")

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        if (data.errorType === "RESEND_COOLDOWN") {
          setMessage("Please wait before requesting a new code.")
        } else {
          setMessage(data.message || "Failed to resend OTP")
        }
        setErrorType(data.errorType)
        return
      }
      
      setMessage("New verification code sent!")
    } catch (err: any) {
      setMessage(err.message || "Failed to resend code.")
      setErrorType("NETWORK_ERROR")
    } finally {
      setLoading(false)
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
                  <FieldDescription>
                    Enter your registered phone number
                  </FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="otp">Enter Verification Code</FieldLabel>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={loading}
                    maxLength={6}
                  />
                  <FieldDescription>
                    Enter the code sent to {phone}
                  </FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>
                </Field>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Didn&apos;t receive code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="underline underline-offset-4 hover:text-primary disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
                <p className="text-sm text-center text-muted-foreground">
                  Or{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone")
                      setMessage("")
                      setErrorType("")
                    }}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    change phone number
                  </button>
                </p>
              </FieldGroup>
            </form>
          )}

          {message && (
            <Alert variant={errorType ? "destructive" : "default"} className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
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
  )
}