import { parseFilterFunction } from "./parseFilterFunction";
import { parseSelectArgs } from "./parseSelectArgs";
import { logger } from "@utils";
import { ANY, KEYWORD } from "./constants";
import { parseDataSource } from "./parseDataSource";
import { TokenMatcher, TokenStream } from "@tokenizer";
import { AST } from "@data";

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
    logger.debug("Optional token not found", token);
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
    file.setFilter(parseFilterFunction(stream));
  }
  ast.addJoin(file);
}

function parseWhere(ast: AST, stream: TokenStream): void {
  do {
    ast.addAnd(parseFilterFunction(stream));
  } while (stream.advanceIf(KEYWORD.AND));
}

function parseOrderBy(ast: AST, stream: TokenStream): void {
  stream.assert(KEYWORD.BY);
  //TODO should parse property
  const parameter = stream.next(ANY.WORD);
  const direction = stream.next(KEYWORD.ASC, KEYWORD.DESC);

  if (direction.is(KEYWORD.ASC)) {
    ast.order = [parameter.value, 1];
  } else {
    ast.order = [parameter.value, -1];
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