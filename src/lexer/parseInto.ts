import { AST } from "../ast";
import { TokenStream } from "../tokenStream";
import { parseVariable } from "./parseVariable";

export function parseInto(ast: AST, stream: TokenStream): void {
  const varName = parseVariable(stream);

  if (!varName) {
    stream.unexpectedToken();
  }

  ast.intoName = varName;
}