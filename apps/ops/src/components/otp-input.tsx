// components/ui/otp-input.tsx
"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useRef, useEffect, useCallback } from "react"

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
}

export function OTPInput({ 
  value, 
  onChange, 
  length = 6, 
  disabled = false 
}: OTPInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  const focusInput = useCallback((index: number) => {
    const input = inputRefs.current[index]
    if (input) {
      input.focus()
      input.select()
    }
  }, [])

  const setInputRef = useCallback((index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el
  }, [])

  const handleChange = useCallback((index: number, newValue: string) => {
    // Only allow numbers
    const numericValue = newValue.replace(/\D/g, '')
    
    if (numericValue) {
      const newOtp = value.split('')
      newOtp[index] = numericValue[0]
      const combinedOtp = newOtp.join('')
      
      onChange(combinedOtp)
      
      // Auto-focus next input
      if (index < length - 1 && numericValue) {
        setTimeout(() => focusInput(index + 1), 10)
      }
    }
  }, [value, onChange, length, focusInput])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      if (!value[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        const newOtp = value.split('')
        newOtp[index - 1] = ''
        onChange(newOtp.join(''))
        focusInput(index - 1)
      } else if (value[index]) {
        // Clear current value if it exists
        const newOtp = value.split('')
        newOtp[index] = ''
        onChange(newOtp.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      focusInput(index + 1)
    } else if (e.key === 'Delete') {
      e.preventDefault()
      const newOtp = value.split('')
      newOtp[index] = ''
      onChange(newOtp.join(''))
    }
  }, [value, onChange, length, focusInput])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length)
    
    if (pastedData) {
      onChange(pastedData)
      // Focus the last input after paste
      setTimeout(() => focusInput(Math.min(pastedData.length, length) - 1), 10)
    }
  }, [onChange, length, focusInput])

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }, [])

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={setInputRef(index)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={handleFocus}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold",
            "border-2 transition-colors",
            "focus:border-primary focus:ring-0",
            disabled && "opacity-50 cursor-not-allowed",
            value[index] ? "border-primary/50" : "border-input"
          )}
        />
      ))}
    </div>
  )
}