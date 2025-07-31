export function cliAssert(
  value: unknown,
  message?: string | (() => string),
): asserts value {
  if (value) return;

  if (message) {
    if (typeof message === "string") {
      throw new Error(message);
    } else {
      const msg = message();
      throw new Error(msg);
    }
  } else {
    throw new Error("Assertion failed");
  }
}
