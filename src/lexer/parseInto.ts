import { AST } from "../ast";
import { TokenStream } from "../tokenStream";
import { Type } from "../token";
import { parseVariable } from "./parseVariable";

export function parseInto(ast: AST, stream: TokenStream): void {
  if (!stream.get().is(Type.word, "INTO")) {
    return;
  }
  stream.advance();

  const varName = parseVariable(stream);

  if (!varName) {
    stream.unexpectedToken();
  }

  ast.intoName = varName;
}