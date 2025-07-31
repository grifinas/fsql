import { TokenStream } from "@tokenizer";
import { KEYWORD } from "@lexer";

export enum LexerState {
  Unknown = "unknown",
  Start = "start",
  SelectStart = "selectStart",
  Select = "select",
  From = "from",
  Join = "join",
  Where = "where",
  Order = "order",
  Group = "group",
  Limit = "limit",
  Offset = "offset",
  Into = "into",
}

/**
 * Return Approximate Lexer state inferred from token stream by going in reverse
 * @param stream TokenStream to infer the last lexer state from, Function modifies stream state
 */
export function simpleLexerState(stream: TokenStream): LexerState {
  if (stream.length === 0) return LexerState.Start;

  stream.setIndex(stream.length);

  while (stream.getIndex() > 0) {
    const token = stream.prev();
    if (token.is(KEYWORD.SELECT)) {
      return stream.hasNext() ? LexerState.Select : LexerState.SelectStart;
    } else if (token.is(KEYWORD.FROM)) {
      return LexerState.From;
    } else if (token.is(KEYWORD.JOIN)) {
      return LexerState.Join;
    } else if (token.is(KEYWORD.WHERE)) {
      return LexerState.Where;
    } else if (token.is(KEYWORD.ORDER)) {
      return LexerState.Order;
    } else if (token.is(KEYWORD.GROUP)) {
      return LexerState.Group;
    } else if (token.is(KEYWORD.LIMIT)) {
      return LexerState.Limit;
    } else if (token.is(KEYWORD.OFFSET)) {
      return LexerState.Offset;
    } else if (token.is(KEYWORD.INTO)) {
      return LexerState.Into;
    }
  }

  return LexerState.Unknown;
}
