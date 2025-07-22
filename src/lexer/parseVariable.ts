import { TokenStream } from "../tokenStream";
import { Type } from "../token";

export function parseVariable(stream: TokenStream): string | null {
  if (!stream.get().is(Type.special, "@")) {
    return null;
  }

  stream.assertNext(Type.word);
  const value = `@${stream.get().value}`;
  stream.advance();
  return value;
}