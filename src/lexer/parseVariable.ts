import { TokenStream } from "../tokenStream";
import { Type } from "../types";
import { ANY } from "./constants";

export function parseVariable(stream: TokenStream): string | null {
  if (!stream.get().is(Type.special, "@")) {
    return null;
  }

  stream.advance();
  if (stream.get().isNotIn([ANY.WORD, ANY.NUMBER])) {
    stream.unexpectedToken();
  }
  const value = `@${stream.get().value}`;
  stream.advance();
  return value;
}