import { Token, Type } from "./token";
import { TokenStream } from "./tokenStream";
import { cliAssert } from "./cliAssert";
import { TypeError } from "./errors";
import { logger } from "./utils/logger";

function isWord(char: string): boolean {
  return /[a-zA-Z\-\_]/.test(char);
}

function isNumber(char: string): boolean {
  return /[0-9]/.test(char);
}

export function tokenize(input: string): TokenStream {
  const tokens: Token[] = [];
  let current = 0;

  while (current < input.length) {
    const position = current;
    let char = input[current];

    if (isWord(char)) {
      let value = "";
      while (current < input.length && isWord(input[current])) {
        value += input[current];
        current++;
      }
      tokens.push(new Token(Type.word, value, position));
      continue;
    }

    if (isNumber(char)) {
      let value = "";
      while (current < input.length && isNumber(input[current])) {
        value += input[current];
        current++;
      }
      tokens.push(new Token(Type.number, value, position));
      continue;
    }

    if (char === "[" || char === "]") {
      tokens.push(new Token(Type.bracket, char, position));
      current++;
      continue;
    }

    if (char === "{" || char === "}") {
      tokens.push(new Token(Type.brace, char, position));
      current++;
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push(new Token(Type.paren, char, position));
      current++;
      continue;
    }

    if (char === ".") {
      tokens.push(new Token(Type.dot, char, position));
      current++;
      continue;
    }

    if (char === ";") {
      tokens.push(new Token(Type.semicolon, char, position));
      current++;
      continue;
    }

    if (char === ",") {
      tokens.push(new Token(Type.comma, char, position));
      current++;
      continue;
    }

    if (char === "=") {
      tokens.push(new Token(Type.equals, char, position));
      current++;
      continue;
    }

    if (char === ">" || char === "<") {
      tokens.push(new Token(Type.comp, char, position));
      current++;
      continue;
    }

    if (["@", "$", "%", "^", "&", "*", "/"].includes(char)) {
      tokens.push(new Token(Type.special, char, position));
      current++;
      continue;
    }

    //Comment
    if (char === "#") {
      let comment = "";
      while (current < input.length && input[current] !== "\n") {
        comment += input[current];
        current++;
      }
      continue;
    }

    // Skip any whitespace
    if (/\s/.test(char)) {
      current++;
      continue;
    }

    logger.error(
      "Unexpected char near:",
      input.substring(current - 10, current + 10)
    );

    throw new TypeError("Unexpected character: " + char);
  }

  return new TokenStream(tokens);
}

export function tokenAssert(token: Token, type: Token["type"], value?: string) {
  const typesEqual = token.type === type;
  const valuesEqual = value ? token.value === value : true;
  cliAssert(
    typesEqual && valuesEqual,
    `Expected token to be ${type}${
      value ? `::${value}` : ""
    }, but got: ${JSON.stringify(token, null, 2)} at ${new Error().stack}`
  );
}

export function unexpectedToken(
  token: Token,
  where?: string,
  expected?: string
): never {
  cliAssert(
    false,
    `Unexpected token ${where ? `in ${where}` : ""}: ${JSON.stringify(
      token,
      null,
      2
    )}${expected ? ` Expected: ${expected}` : ""}`
  );
}