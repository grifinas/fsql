import { logger } from "./utils/logger";

export function cliAssert(
  value: unknown,
  message?: string | Function
): asserts value {
  if (value) return;

  if (message) {
    if (typeof message === "string") {
      logger.error(message);
    } else {
      logger.error(message());
    }
  }
  throw new Error();
}
