// controllers/auth/validate.controller.ts
import { prisma } from "@/utils/prisma";

export const validate = async ({ jwt, set, headers }: any) => {
  const authHeader = headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    set.status = 401;
    return { 
      success: false, 
      message: "Missing or invalid authorization header",
      errorType: "MISSING_TOKEN"
    };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // Verify the token
    const payload = await jwt.verify(token);
    
    if (!payload || payload.type !== "access") {
      set.status = 403;
      return { 
        success: false, 
        message: "Invalid token type",
        errorType: "INVALID_TOKEN_TYPE"
      };
    }

    // Check if user still exists and is active
    const user = await prisma.teamMember.findUnique({
      where: { 
        id: payload.id,
        isActive: true 
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      set.status = 404;
      return { 
        success: false, 
        message: "User not found or inactive",
        errorType: "USER_NOT_FOUND"
      };
    }

    set.status = 200;
    return {
      success: true,
      message: "Token is valid",
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        department: user.department,
      },
    };
  } catch (error: any) {
    console.error("Token Validation Error:", error);
    
    if (error.message.includes("expired")) {
      set.status = 403;
      return { 
        success: false, 
        message: "Token has expired",
        errorType: "TOKEN_EXPIRED"
      };
    }
    
    if (error.message.includes("invalid") || error.message.includes("malformed")) {
      set.status = 403;
      return { 
        success: false, 
        message: "Invalid token",
        errorType: "INVALID_TOKEN"
      };
    }

    set.status = 500;
    return { 
      success: false, 
      message: "Token validation failed",
      errorType: "VALIDATION_FAILED"
    };
  }
};