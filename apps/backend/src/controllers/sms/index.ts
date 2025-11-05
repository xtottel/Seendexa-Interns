// controllers/sms/index.ts
import { getSmsHistory, getSmsStats } from "./history.controller";
import { getBulkSends, getBulkSendStats } from "./bulk-sends.controller";
import { getSmsOverview, getNetworkDistribution } from "./analytics.controller";

export const smsController = {
  // SMS History
  getSmsHistory,
  getSmsStats,
  
  // Bulk Sends
  getBulkSends,
  getBulkSendStats,
  
  // Analytics
  getSmsOverview,
  getNetworkDistribution,
};