import { AST, WhereFunction } from "./ast";
import { Type } from "./token";
import { TokenStream } from "./tokenStream";

export function lex(stream: TokenStream): AST {
  const ast = new AST();

  parseSelectArgs(ast, stream);
  parseFrom(ast, stream);
  optional(parseJoin, ast, stream);
  optional(parseWhere, ast, stream);
  optional(parseOrderBy, ast, stream);

  return ast;
}

function parseFrom(ast: AST, stream: TokenStream) {
  stream.assert(Type.word, "from", false);
  ast.mainfile = parseFile(stream);
}

function parseSelectArgs(ast: AST, stream: TokenStream) {
  stream.assert(Type.word, "select", false);
  if (stream.next().is(Type.special, "*")) {
    ast.all = true;
    stream.next();
  } else {
    ast.all = false;
    let token = stream.get();
    while (token) {
      stream.assert(Type.word);
      ast.columns.push(token.value);
      if (stream.next().is(Type.comma)) {
        token = stream.next();
        continue;
      } else {
        break;
      }
    }
  }
}

function parseFile(stream: TokenStream): string {
  let path = "";
  let lastWasText = false;
  while (stream.hasNext()) {
    const fileToken = stream.next();
    if (fileToken.is(Type.dot) || fileToken.is(Type.special, '/')) {
        path += fileToken.value;
        lastWasText = false;
    } else if (fileToken.is(Type.word)) {
        if (lastWasText) {
            return path;
        } else {
            path += fileToken.value;
            lastWasText = true;
        }    
    } else if (fileToken.is(Type.number)) {
        path += fileToken.value;
    } else {
        stream.unexpectedToken();
    }
  }

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
  if (!stream.peek().is(Type.word, "JOIN", false)) {
    return;
  }

  stream.next();
  const file = parseFile(stream);
  if (stream.next().is(Type.word, "ON", false)) {
    ast.joinFiles[file] = __whereFunction(stream);
  } else {
    ast.joinFiles[file] = () => true;
  }
  console.log("after join", stream.get());
}

function parseWhere(ast: AST, stream: TokenStream): void {
  if (!stream.peek().is(Type.word, "WHERE", false)) {
    return;
  }

  stream.next();
  ast.addAnd(__whereFunction(stream));
}

function parseOrderBy(ast: AST, stream: TokenStream): void {
  if (!stream.peek().is(Type.word, "ORDER", false)) {
    return;
  }
  stream.next();
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

function __whereFunction(stream: TokenStream): WhereFunction {
  const propertyToken = stream.next();
  stream.assert(Type.word);
  const property = propertyToken.value; //b
  const comparatorToken = stream.next(); // >
  if (comparatorToken.is(Type.comp) || comparatorToken.is(Type.equals)) {
    const valueToken = stream.next();
    const value = valueToken.is(Type.number)
      ? Number(valueToken.value)
      : valueToken.value;

    return (row) => {
      const key = row[property as keyof typeof row] as any;
      //   console.log(property, `(${key})`, comparatorToken.value, value);
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
}
