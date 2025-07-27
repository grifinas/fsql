import { TokenStream } from "@tokenizer";
import { ANY, KEYWORD, RESERVED_WORDS, Symbols } from "./constants";
import { IAlias } from "@types";
import { logger } from "@utils";

export function parseVarAlias(stream: TokenStream): string | null {
  if (stream.advanceIf(KEYWORD.AS)) {
    stream.consume(Symbols.AT);
    const aliasToken = stream.consume(ANY.WORD);
    if (aliasToken.isIn(RESERVED_WORDS)) {
      stream.regress();
      stream.unexpectedToken("Any non-reserved word");
    }

    logger.debug("Alias is", aliasToken.value);
    return `@${aliasToken.value}`;
  }

  return null;
}

export function parseAlias(stream: TokenStream): string | null {
  if (stream.advanceIf(KEYWORD.AS)) {
    const aliasToken = stream.consume(ANY.WORD);
    if (aliasToken.isIn(RESERVED_WORDS)) {
      stream.regress();
      stream.unexpectedToken("Any non-reserved word");
    }

    logger.debug("Alias is", aliasToken.value);
    return aliasToken.value;
  }

  return null;
}

export function withAlias<T extends IAlias>(
  fn: (stream: TokenStream) => T,
  stream: TokenStream,
): T {
  const aliasable = fn(stream);
  const alias = parseAlias(stream);
  if (alias) {
    aliasable.setAlias(alias);
  }
  return aliasable;
}

export function withVarAlias<T extends IAlias>(
  fn: (stream: TokenStream) => T,
  stream: TokenStream,
): T {
  const aliasable = fn(stream);
  const alias = parseVarAlias(stream);
  if (alias) {
    aliasable.setAlias(alias);
  }
  return aliasable;
}
