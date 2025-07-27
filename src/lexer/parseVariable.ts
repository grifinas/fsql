import { TokenStream } from "../tokenStream";
import { ANY, Symbols } from "./constants";

export function parseVariable(stream: TokenStream): string | null {
  if (!stream.get().is(Symbols.AT)) {
    return null;
  }

  stream.advance();
  if (stream.get().isNotIn([ANY.WORD, ANY.NUMBER])) {
    stream.unexpectedToken([ANY.WORD, ANY.NUMBER]);
  }
  const value = `@${stream.get().value}`;
  stream.advance();
  return value;
}