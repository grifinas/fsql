export function cliAssert(
  value: unknown,
  message?: string | Function
): asserts value {
  if (value) return;

  if (message) {
    if (typeof message === "string") {
      console.error(message);
    } else {
      console.error(message());
    }
  }
  throw new Error();
}
