import { TokenStream } from "@tokenizer";
import { ANY, SYMBOL } from "./constants";

export function parseVariable(stream: TokenStream): string | null {
  if (!stream.advanceIf(SYMBOL.AT)) {
    return null;
  }

  const token = stream.consume(ANY.WORD, ANY.NUMBER);
  const value = `@${token.value}`;
  return value;
}
