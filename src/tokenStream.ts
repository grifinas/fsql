import { cliAssert } from "./cliAssert";
import { Token } from "./token";
import { TokenMatcher } from "./tokenMatcher";
import { Type } from "./types";

type TokenExpectations = (Token | TokenMatcher)[];
type Expectations = TokenExpectations | string;

export class TokenStream {
  private index: number = 0;

  constructor(private readonly tokens: Token[]) {
  }

  get length(): number {
    return this.tokens.length;
  }

  get(...matchers: TokenMatcher[]): Token {
    const token = this.tokens[this.index];
    if (!token) {
      throw new Error(
        `No token at index: ${this.index}, there are ${this.tokens.length} tokens`
      );
    }
    if (matchers.length && !matchers.some(matcher => token.is(matcher))) {
      this.unexpectedToken(matchers);
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

  advanceIf(token: TokenMatcher) {
    if (this.done()) return false;
    if (this.get().is(token)) {
      this.advance();
      return true;
    }
    return false;
  }

  advance() {
    this.index++;
  }
  
  regress() {
    this.index--;
  }

  setIndex(i: number) {
    this.index = i;
  }

  getIndex(): number {
    return this.index;
  }

  next(...matchers: TokenMatcher[]): Token {
    this.index++;
    return this.get(...matchers);
  }

  prev(): Token {
    this.index--;
    return this.get();
  }

  done(): boolean {
    return this.index >= this.tokens.length;
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
    const startIdx = Math.max(0, this.index - start);
    const endIdx = Math.min(this.tokens.length, this.index + end);
    const relevantTokens = this.tokens.slice(startIdx, endIdx);

    // Create the token visualization line
    const tokenLine = relevantTokens.map((token, i) => {
      const str = stringifyToken(token);
      return startIdx + i === this.index ? `[${str}]` : str;
    }).join(' ');

    // Create the pointer line
    const beforeTokens = relevantTokens.slice(0, this.index - startIdx);
    const pointerOffset = beforeTokens.reduce(
      (l, token) => l + stringifyToken(token).length + 1, // +1 for the space we added
      0
    );

    // Create a detailed token info line
    const currentToken = this.tokens[this.index];
    const tokenInfo = currentToken ?
      `Current token: ${currentToken.type}::${currentToken.value}` :
      'No current token';

    return [
      '\nToken stream context:',
      tokenLine,
      ' '.repeat(pointerOffset) + '^',
      tokenInfo,
      `Position: ${this.index + 1}/${this.tokens.length}`,
      new Error().stack
    ].join('\n');
  }

  assert(match: TokenMatcher): this {
    const token = this.get();
    cliAssert(
      token.is(match),
      () =>
        `Expected token to be ${match.toString()}, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`
    );

    return this;
  }

  assertNext(match: TokenMatcher): this {
    const token = this.next();
    cliAssert(
      token.is(match),
      () =>
        `Expected token to be ${match.toString()}, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`
    );

    return this;
  }

  unexpectedToken(expected: Expectations = []): never {
    const expectedString = typeof expected === 'string' ? expected : expected.map(token => token.toString()).join(" ");
    const token = this.get();
    cliAssert(
      false,
      () => `Unexpected token: ${token.value}::${token.type} 
          ${expected.length > 0 ? ` Expected: ${expectedString}` : ""} at ${this.stringifyTokenContext()}`
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
