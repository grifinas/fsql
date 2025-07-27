import { AST } from "../ast";
import { TokenStream } from "../tokenStream";
import { parseDataSource } from "./parseDataSource";
import { parseFilterFunction } from "./parseFilterFunction";
import { parseSelectArgs } from "./parseSelectArgs";
import { logger } from "../utils/logger";
import { ANY, KEYWORD } from "./constants";
import { TokenMatcher } from "../tokenMatcher";
import { parseProperty } from "./parseProperty";

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
  optional(ANY.SEMICOLON, parseSemicolon);

  return _ast;
}

function parseFrom(ast: AST, stream: TokenStream) {
  stream.assert(KEYWORD.FROM).advance();
  ast.setMain(parseDataSource(stream));
}

export function optional(
  token: TokenMatcher,
  fn: (ast: AST, stream: TokenStream) => void,
): void {
  if (stream.done()) {
    logger.debug("Stream is done");
    return;
  }

  if (stream.advanceIf(token)) {
    fn(ast, stream);
  } else {
    logger.debug("Token not found", token);
  }
}

export function chainable(token: TokenMatcher, fn: (ast: AST, stream: TokenStream) => void): void {
  while (stream.advanceIf(token)) {
    fn(ast, stream);
  }
}

function parseJoin(ast: AST, stream: TokenStream): void {
  const file = parseDataSource(stream);
  if (stream.advanceIf(KEYWORD.ON)) {
    ast.addJoin(file, parseFilterFunction(stream));
  } else {
    ast.addJoin(file);
  }
}

function parseWhere(ast: AST, stream: TokenStream): void {
  do {
    ast.addAnd(parseFilterFunction(stream));
  } while (stream.advanceIf(KEYWORD.AND));
}

function parseOrderBy(ast: AST, stream: TokenStream): void {
  stream.assert(KEYWORD.BY);
  stream.assertNext(ANY.WORD);
  //TODO should parse property
  const parameter = stream.get();
  const direction = stream.next();

  if (direction.is(KEYWORD.ASC)) {
    ast.order = [parameter.value, 1];
  } else if (direction.is(KEYWORD.DESC)) {
    ast.order = [parameter.value, -1];
  } else {
    stream.unexpectedToken([KEYWORD.ASC, KEYWORD.DESC]);
  }
}

function parseSemicolon(ast: AST, stream: TokenStream): void {
  if (stream.done()) {
    logger.debug("Found semicolon finishing a statement, nothing to do");
    return;
  }
  ast.next = lex(stream);
}

function parseInto(ast: AST, stream: TokenStream): void {
  ast.into = parseDataSource(stream);
}