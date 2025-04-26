import { cliAssert } from "./cliAssert";
import { Token, Type } from "./token";

export class TokenStream {
  private index: number = 0;

  constructor(private readonly tokens: Token[]) {
    // console.log("tokens", tokens);
  }

  get(): Token {
    const token = this.tokens[this.index];
    if (!token) {
      throw new Error(
        `No token at index: ${this.index}, there are ${this.tokens.length} tokens`
      );
    }
    return token;
  }

  getIndexed(i: number): Token {
    const token = this.tokens[i];
    if (!token) {
      throw new Error(
        `No token at index: ${i}, there are ${this.tokens.length} tokens`
      );
    }
    return token;
  }

  next(): Token {
    this.index++;
    return this.get();
  }

  prev(): Token {
    this.index--;
    return this.get();
  }

  hasNext(): boolean {
    return this.tokens.length > this.index + 1;
  }

  peek(offset: number = 1): Token {
    return this.getIndexed(this.index + offset);
  }

  multiPeek(offset: number = 1): Token[] {
    const results = [];
    for (let i = 0; i < offset; i++) {
      results.push(this.getIndexed(this.index + i));
    }
    return results;
  }

  toString(): string {
    return this.tokens.map(stringifyToken).join("");
  }

  toStringFromCurrent(): string {
    return [...this.tokens].splice(this.index).map(stringifyToken).join("");
  }

  stringifyTokenContext(start: number = 5, end: number = 2): string {
    const relevantTokens = [...this.tokens].splice(
      this.index - start,
      start + end
    );

    const beforeTokens = [...relevantTokens].splice(0, start);
    const length = beforeTokens.reduce(
      (l, token) => l + stringifyToken(token).length,
      0
    );
    const relevantLine = relevantTokens.map(stringifyToken).join("");
    return (
      "\n" +
      relevantLine +
      "\n" +
      " ".repeat(length) +
      "^" +
      "\n" +
      new Error().stack
    );
  }
  assert(type: Type, value?: string, caseSensitive = true) {
    const token = this.get();
    cliAssert(
      token.is(type, value, caseSensitive),
      () =>
        `Expected token to be ${type}${
          value ? `::${value}` : ""
        }, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`
    );
  }

  assertNext(type: Token["type"], value?: string) {
    const token = this.next();
    const typesEqual = token.type === type;
    const valuesEqual = value ? token.value === value : true;
    cliAssert(
      typesEqual && valuesEqual,
      () =>
        `Expected token to be ${type}${
          value ? `::${value}` : ""
        }, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`
    );
  }

  unexpectedToken(where?: string, expected?: string): never {
    const token = this.get();
    cliAssert(
      false,
      () => `Unexpected token ${where ? `in ${where}` : ""}: ${token.value}::${token.type} 
          ${expected ? ` Expected: ${expected}` : ""} at ${this.stringifyTokenContext()}`
    );
  }
}

export function stringifyToken(token: Token): string {
  switch (token.type) {
    case Type.equals:
    case Type.word:
      return token.value + " ";
    default:
      return token.value;
  }
}
