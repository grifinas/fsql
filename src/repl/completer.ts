import { CompleterResult } from "readline";
import { autocomplete } from "@lexer";

export function completer(
  line: string,
  callback: (err?: null | Error, result?: CompleterResult) => void,
) {
  try {
    autocomplete(line).then((result) => {
      callback(null, result);
    });
  } catch (error) {
    callback(error instanceof Error ? error : new Error("Unexpected error"));
  }
}
