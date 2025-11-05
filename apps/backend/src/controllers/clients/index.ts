// controllers/clients/index.ts
import { getAll } from "./get-all.controller";
import { getById } from "./get-by-id.controller";
import { getStats } from "./stats.controller";
import { updateStatus } from "./update-status.controller";
import { getTransactions } from "./transactions.controller";


export const clientsController = {
  getAll,
  getById,
  getStats,
  updateStatus,
  getTransactions,
};