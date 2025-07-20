import { AST } from "../ast";
import { Token, Type } from "../token";
import { TokenStream } from "../tokenStream";
import { parseInto } from "./parseInto";
import { parseFile } from "./parseFile";
import { parseFilterFunction } from "./parseFilterFunction";
import { parseSelectArgs } from "./parseSelectArgs";
import { logger } from "../utils/logger";
import { KEYWORD } from "./constants";
import { withAlias } from "./parseAlias";
import { DataSource, FileDataSource } from "../dataSource";

let ast: AST;
let stream: TokenStream;

export function lex(_stream: TokenStream): AST {
  stream = _stream;
  const _ast = new AST();
  ast = _ast;

  logger.info("lex", stream.toString());
  parseSelectArgs(ast, stream);
  parseFrom(ast, stream);
  chainable(KEYWORD.JOIN, parseJoin);
  optional(KEYWORD.WHERE, parseWhere);
  optional(KEYWORD.ORDER, parseOrderBy);
  optional(KEYWORD.INTO, parseInto);
  optional(new Token(Type.semicolon, ";"), parseSemicolon);

  return _ast;
}

function parseFrom(ast: AST, stream: TokenStream) {
  stream.assert(Type.word, "FROM").advance();
  ast.setMain(parseFile(stream));
}

export function optional(
  token: Token,
  fn: (ast: AST, stream: TokenStream) => void,
): void {
  if (stream.done()) {
    logger.debug("Stream is done");
    return;
  }

  if (stream.advanceIf(token.type, token.value)) {
    fn(ast, stream);
  } else {
    logger.debug("Token not found", token);
  }
}

export function chainable(token: Token, fn: (ast: AST, stream: TokenStream) => void): void {
  while (stream.advanceIf(token.type, token.value)) {
    fn(ast, stream);
  }
}

function parseJoin(ast: AST, stream: TokenStream): void {
  const file = parseFile(stream);
  if (stream.advanceIf(Type.word, "ON")) {
    ast.addJoin(file, parseFilterFunction(stream));
  } else {
    ast.addJoin(file);
  }
}

function parseWhere(ast: AST, stream: TokenStream): void {
  do {
    ast.addAnd(parseFilterFunction(stream));
  } while (stream.advanceIf(Type.word, "AND"));
}

function parseOrderBy(ast: AST, stream: TokenStream): void {
  stream.assert(Type.word, "BY");
  stream.assertNext(Type.word);
  const parameter = stream.get();
  const direction = stream.next();

  if (direction.is(KEYWORD.ASC)) {
    ast.order = [parameter.value, 1];
  } else if (direction.is(KEYWORD.DESC)) {
    ast.order = [parameter.value, -1];
  } else {
    stream.unexpectedToken();
  }
}

function parseSemicolon(ast: AST, stream: TokenStream): void {
  if (stream.done()) {
    logger.debug("Found semicolon finishing statement");
    return;
  }
  ast.next = lex(stream);
}