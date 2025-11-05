// src/controllers/health/health.controller.ts
export const healthCheck = async ({ set }: any) => {
  try {
    set.status = 200;
    return {
      success: true,
      message: "Server is healthy!",
      timestamp: new Date().toISOString(),
      service: "SMS Gateway API",
      status: "operational"
    };
  } catch (error: any) {
    set.status = 500;
    return {
      success: false,
      message: "Server health check failed",
      error: error.message
    };
  }
};