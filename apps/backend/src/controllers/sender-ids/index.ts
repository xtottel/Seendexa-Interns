// controllers/sender-ids/index.ts
import { getAll } from "./get-all.controller";
import { getById } from "./get-by-id.controller";
import { approve } from "./approve.controller";
import { reject } from "./reject.controller";
import { getStats } from "./stats.controller";

export const senderIdsController = {
  getAll,
  getById,
  approve,
  reject,
  getStats,
};