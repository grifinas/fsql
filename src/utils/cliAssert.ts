import { logger } from "./logger";

export function cliAssert(
  value: unknown,
  message?: string | (() => string)
): asserts value {
  if (value) return;

  if (message) {
    if (typeof message === "string") {
      logger.error(message);
      throw new Error(message);
    } else {
      const msg = message();
      logger.error(msg);
      throw new Error(msg);
    }
  } else {
    throw new Error("Assertion failed");
  }
}
