import { Elysia } from "elysia";
import { logger } from "../utils/logger";

export const loggerPlugin = (app: Elysia) =>
  app
    .onRequest(({ request }) => {
      logger.info(
        { method: request.method, url: request.url },
        "Incoming request"
      );
    })
    .onAfterHandle(({ request, response }) => {
      logger.info(
        {
          method: request.method,
          url: request.url,
          status: response instanceof Response ? response.status : "unknown",
        },
        "Request completed"
      );
    });
