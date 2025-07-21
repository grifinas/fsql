import { AST } from "../ast";
import { Type } from "../token";
import { TokenStream } from "../tokenStream";
import { parseInto } from "./parseInto";
import { parseFile } from "./parseFile";
import { parseFilterFunction } from "./parseFilterFunction";
import { parseSelectArgs } from "./parseSelectArgs";
import { logger } from "../utils/logger";

export function lex(stream: TokenStream): AST {
  const ast = new AST();

  logger.info("lex", stream.toString());
  parseSelectArgs(ast, stream);
  parseFrom(ast, stream);
  optional(parseJoin, ast, stream);
  optional(parseWhere, ast, stream);
  optional(parseOrderBy, ast, stream);
  optional(parseInto, ast, stream);
  optional(parseSemicolon, ast, stream);

  return ast;
}

function parseFrom(ast: AST, stream: TokenStream) {
  stream.assert(Type.word, "FROM").advance();
  ast.setMain(parseFile(stream));
}

function optional(
  fn: (ast: AST, stream: TokenStream) => void,
  ast: AST,
  stream: TokenStream
): void {
  if (!stream.hasNext()) {
    return;
  }

  fn(ast, stream);
}

function parseJoin(ast: AST, stream: TokenStream): void {
  while (stream.advanceIf(Type.word, "JOIN")) {
    const file = parseFile(stream);
    if (stream.advanceIf(Type.word, "ON")) {
      ast.addJoin(file, parseFilterFunction(stream));
    } else {
      ast.addJoin(file);
    }
  }
}

function parseWhere(ast: AST, stream: TokenStream): void {
  if (!stream.advanceIf(Type.word, "WHERE")) {
    logger.debug("No WHERE found");
    return;
  }

  ast.addAnd(parseFilterFunction(stream));
}

function parseOrderBy(ast: AST, stream: TokenStream): void {
  if (!stream.advanceIf(Type.word, "ORDER")) {
    logger.debug("No ORDER BY found");
    return;
  }
  stream.assert(Type.word, "BY");
  const parameter = stream.next();
  stream.assert(Type.word);
  if (stream.next().is(Type.word, "ASC")) {
    ast.order = [parameter.value, 1];
  } else if (stream.get().is(Type.word, "DESC")) {
    ast.order = [parameter.value, -1];
  } else {
    stream.unexpectedToken();
  }
}

function parseSemicolon(ast: AST, stream: TokenStream): void {
  if (!stream.advanceIf(Type.semicolon)) {
    logger.debug("No semicolon found");
    return;
  }
  if (stream.done()) {
    logger.debug("Found semicolon finishing statement");
    return;
  }
  ast.next = lex(stream);
}