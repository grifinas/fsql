import { TokenStream } from "../tokenizer/tokenStream";
import { ANY, Symbols } from "./constants";

export function parseVariable(stream: TokenStream): string | null {
  if (!stream.advanceIf(Symbols.AT)) {
    return null;
  }

  const token = stream.get(ANY.WORD, ANY.NUMBER);
  const value = `@${token.value}`;
  stream.advance();
  return value;
}