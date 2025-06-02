import { AST, WhereFunction } from "./ast";
import { Token, Type } from "./token";
import { TokenStream } from "./tokenStream";

export function lex(stream: TokenStream): AST {
  const ast = new AST();

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
  stream.assert(Type.word, "FROM", false);
  ast.mainfile = parseFile(stream);
}

function parseSelectArgs(ast: AST, stream: TokenStream) {
  stream.assert(Type.word, "SELECT", false);
  if (stream.popNextIf(Type.special, "*")) {
    stream.next();
    return;
  }

  do {
    stream.assertNext(Type.word);
    const fieldName = stream.get().value;

    // Check for alias with 'as' keyword
    if (stream.popNextIf(Type.word, "as", false)) {
      stream.assertNext(Type.word);
      const alias = stream.get().value;
      ast.addField(fieldName, alias);
    } else {
      ast.addField(fieldName);
    }
  } while (stream.popNextIf(Type.comma))

  //move from last fieldName
  stream.next();
}

function parseFile(stream: TokenStream): string {
  let path = "";
  let lastWasText = false;
  //If the next token is an @, then we're selecting from a variable, so we return the token after that
  if (stream.popNextIf(Type.special, "@", false)) {
    return '@' + stream.next().value;
  }

  while (stream.hasNext()) {
    const fileToken = stream.next();
    if (fileToken.is(Type.dot) || fileToken.is(Type.special, '/')) {
      path += fileToken.value;
      lastWasText = false;
    } else if (fileToken.is(Type.word)) {
      if (lastWasText) {
        stream.prev();
        return path;
      } else {
        path += fileToken.value;
        lastWasText = true;
      }
    } else if (fileToken.is(Type.semicolon)) {
      stream.prev();
      return path;
    } else if (fileToken.is(Type.number)) {
      path += fileToken.value;
    } else {
      stream.unexpectedToken();
    }
  }

  //At this point we're at the final word
  return path;
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
  while (stream.popNextIf(Type.word, "JOIN", false)) {
    const file = parseFile(stream);
    if (stream.popNextIf(Type.word, "ON", false)) {
      ast.joinFiles[file] = __whereFunction(stream);
    } else {
      ast.joinFiles[file] = () => true;
    }
  }
}

function parseWhere(ast: AST, stream: TokenStream): void {
  if (!stream.popNextIf(Type.word, "WHERE", false)) {
    return;
  }

  ast.addAnd(__whereFunction(stream));
}

function parseOrderBy(ast: AST, stream: TokenStream): void {
  if (!stream.popNextIf(Type.word, "ORDER", false)) {
    return;
  }
  stream.next();
  stream.assert(Type.word, "BY", false);
  const parameter = stream.next();
  stream.assert(Type.word);
  if (stream.next().is(Type.word, "ASC", false)) {
    ast.order = [parameter.value, 1];
  } else if (stream.get().is(Type.word, "DESC", false)) {
    ast.order = [parameter.value, -1];
  } else {
    stream.unexpectedToken();
  }
}

function parseInto(ast: AST, stream: TokenStream): void {
  if (!stream.popNextIf(Type.word, "INTO", false)) {
    return;
  }
  stream.assertNext(Type.special, "@", false);
  stream.assertNext(Type.word);
  ast.intoName = stream.get().value;
}

function parseSemicolon(ast: AST, stream: TokenStream): void {
  if (stream.popNextIf(Type.semicolon) && stream.hasNext()) {
    stream.next();
    ast.next = lex(stream);
  }
}

function __whereFunction(stream: TokenStream): WhereFunction {
  stream.assertNext(Type.word);
  const property = stream.get().value;
  const comparatorToken = stream.next();
  if (comparatorToken.is(Type.comp) || comparatorToken.is(Type.equals)) {
    const valueToken = stream.next();
    const value = getValueFromToken(valueToken);

    return (row) => {
      const key = row[property as keyof typeof row] as any;
      switch (comparatorToken.value) {
        case ">":
          return key > value;
        case "<":
          return key < value;
        case "=":
          return key === value;
        default:
          throw new Error(`Unknown comparator: ${comparatorToken.value}`);
      }
    };
  } else {
    stream.unexpectedToken();
  }

  function getValueFromToken(token: Token): string | number | boolean {
    if (token.is(Type.number)) {
      return Number(token.value);
    } else if (token.is(Type.word)) {
      return ['true', 'false'].includes(token.value) ? token.value === 'true' : token.value;
    } else {
      throw new Error(`Unknown token type: ${token.type}`);
    }
  }
}
