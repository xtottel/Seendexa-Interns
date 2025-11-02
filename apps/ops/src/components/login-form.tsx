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
import { Lock } from "lucide-react"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/login/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send OTP")
      setStep("otp")
      setMessage("OTP sent successfully!")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Invalid OTP")
      setMessage("Login successful! Redirecting...")
      window.location.href = "/home"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage(err.message)
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
                    placeholder="+233501234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="otp">Enter OTP</FieldLabel>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </Field>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Didn’t receive OTP?{" "}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Resend
                  </button>
                </p>
              </FieldGroup>
            </form>
          )}

          {message && (
            <p className="text-center text-sm mt-4 text-muted-foreground">
              {message}
            </p>
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
