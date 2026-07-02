import { parseFilterFunction } from "./parseFilterFunction";
import { parseSelectArgs } from "./parseSelectArgs";
import { logger } from "@utils";
import { ANY, KEYWORD } from "./constants";
import { parseDataSource } from "./parseDataSource";
import { TokenMatcher, TokenStream } from "@tokenizer";
import { AST } from "@data";
import { parseField } from '@src/lexer/parseField';
import { FieldProperty, ResolvedProperty } from '@entities';

let ast: AST;
let stream: TokenStream;

export function lex(_stream: TokenStream): AST {
  stream = _stream;
  const _ast = new AST();
  ast = _ast;

  logger.log("lex", stream.toString());
  parseSelectArgs(ast, stream);
  conditional(
    KEYWORD.FROM,
    (ast: AST, stream: TokenStream) => {
      parseFrom(ast, stream);
      chainable(KEYWORD.JOIN, parseJoin);
      optional(KEYWORD.WHERE, parseWhere);
      optional(KEYWORD.GROUP, parseGroupBy);
      optional(KEYWORD.ORDER, parseOrderBy);
      optional(KEYWORD.LIMIT, parseLimit);
      optional(KEYWORD.OFFSET, parseOffset);
      optional(KEYWORD.INTO, parseInto);
      optional(ANY.SEMICOLON, parseSemicolon);
    },
    parseWithoutFrom,
  );

  if (!stream.done())
    throw new Error(
      `Expected stream to be done, but found token: ${stream.get()}`,
    );

  return _ast;
}

function parseWithoutFrom() {
  optional(KEYWORD.INTO, parseInto);
  optional(ANY.SEMICOLON, parseSemicolon);
}

function parseFrom(ast: AST, stream: TokenStream) {
  ast.setMain(parseDataSource(stream));
}

export function conditional(
  token: TokenMatcher,
  trueFn: (ast: AST, stream: TokenStream) => void,
  falseFn: (ast: AST, stream: TokenStream) => void,
): void {
  if (stream.done()) {
    logger.debug("Stream is done");
    return;
  }

  if (stream.advanceIf(token)) {
    logger.debug("Conditional true", token);
    trueFn(ast, stream);
  } else {
    logger.debug("Conditional false", token);
    falseFn(ast, stream);
  }
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
    logger.debug(
      "Optional token not found",
      token,
      stream.toStringFromCurrent(),
    );
  }
}

export function chainable(
  token: TokenMatcher,
  fn: (ast: AST, stream: TokenStream) => void,
): void {
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
  if (!ast.mainfile) {
    throw new Error("WHERE clause requires FROM");
  }
  do {
    ast.addAnd(parseFilterFunction(stream));
  } while (stream.advanceIf(KEYWORD.AND));
}

function parseOrderBy(ast: AST, stream: TokenStream): void {
  if (!ast.mainfile) {
    throw new Error("ORDER BY clause requires FROM");
  }
  stream.consume(KEYWORD.BY);
  //TODO should parse property
  const parameter = stream.consume(ANY.WORD);
  const direction = stream.consume(KEYWORD.ASC, KEYWORD.DESC);

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

function parseLimit(ast: AST, stream: TokenStream): void {
  const limitToken = stream.consume(ANY.NUMBER);
  const limitValue = parseInt(limitToken.value, 10);

  if (isNaN(limitValue) || limitValue < 0) {
    stream.regress();
    stream.unexpectedToken("Number >= 0");
  }

  ast.setLimit(limitValue);
}

function parseOffset(ast: AST, stream: TokenStream): void {
  const offsetToken = stream.consume(ANY.NUMBER);
  const offsetValue = parseInt(offsetToken.value, 10);

  if (isNaN(offsetValue) || offsetValue < 0) {
    stream.regress();
    stream.unexpectedToken("Number >= 0");
  }

  ast.setOffset(offsetValue);
}

function parseGroupBy(ast: AST, stream: TokenStream): void {
  stream.consume(KEYWORD.BY);

  const groupByFields: FieldProperty[] = [];

  // Parse first field
  const firstField = parseField(stream);
  if (firstField instanceof FieldProperty) {
    groupByFields.push(firstField);
  } else {
    stream.unexpectedToken(`Expected a field property, got: ${firstField.__type}`);
  }

  // Parse additional fields separated by commas
  while (stream.advanceIf(ANY.COMMA)) {
    const field = parseField(stream);
    if (field instanceof FieldProperty) {
      groupByFields.push(field);
    } else {
      stream.unexpectedToken(`Expected a field property, got: ${field.__type}`);
    }
  }

  ast.setGroupBy(groupByFields);
}
