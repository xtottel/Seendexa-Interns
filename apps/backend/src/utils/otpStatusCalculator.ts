// utils/otpStatusCalculator.ts
export const calculateCodeStatus = (
  createdAt: Date, 
  expiresAt: Date, 
  validationAttempts: number, 
  maxValidationAttempts: number
): string => {
  const now = new Date();
  
  // Check if exceeded max validation attempts
  if (validationAttempts >= maxValidationAttempts) {
    return 'blocked';
  }
  
  // Check if expired
  if (now > expiresAt) {
    return 'expired';
  }
  
  // For used status, we need additional logic - you might need to track this separately
  // For now, we'll assume it's active if not blocked or expired
  return 'active';
};