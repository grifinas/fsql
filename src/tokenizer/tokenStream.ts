import { cliAssert } from "@utils";
import { Token } from "./token";
import { TokenMatcher } from "./tokenMatcher";
import chalk from "chalk";

type TokenExpectations = (Token | TokenMatcher)[];
type Expectations = TokenExpectations | string;

export class TokenStream {
  private index: number = 0;

  constructor(private readonly tokens: Token[]) {}

  get length(): number {
    return this.tokens.length;
  }

  get(...matchers: TokenMatcher[]): Token {
    const token = this.tokens[this.index];
    if (!token) {
      throw new Error(
        `No token at index: ${this.index}, there are ${this.tokens.length} tokens`,
      );
    }
    if (matchers.length && !matchers.some((matcher) => token.is(matcher))) {
      this.unexpectedToken(matchers);
    }
    return token;
  }

  consume(...matchers: TokenMatcher[]): Token {
    const token = this.get(...matchers);
    this.advance();
    return token;
  }

  getIndexed(i: number): Token {
    const token = this.tokens[i];
    if (!token) {
      throw new Error(
        `No token at index: ${i}, there are ${this.tokens.length} tokens`,
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

  hasNext(): boolean {
    return this.index + 1 < this.tokens.length;
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

  toString(): string {
    return this.tokens
      .map((token, i) => stringifyToken(token, this.tokens[i + 1]))
      .join("");
  }

  toStringFromCurrent(): string {
    const currentTokens = [...this.tokens].splice(this.index);
    return currentTokens
      .map((token, i) => stringifyToken(token, currentTokens[i + 1]))
      .join("");
  }

  stringifyTokenContext(start: number = 10, end: number = 3): string {
    const startIdx = Math.max(0, this.index - start);
    const endIdx = Math.min(this.tokens.length, this.index + end);
    const relevantTokens = this.tokens.slice(startIdx, endIdx);
    let pointerOffset = 0;

    // Create the token visualization line
    const tokenLine = relevantTokens
      .map((token, i) => {
        const [strToken, spaces] = stringifyToken(token, relevantTokens[i + 1]);
        if (startIdx + i === this.index) {
          pointerOffset++;
          return `[${chalk.red(strToken)}]${spaces}`;
        }
        pointerOffset += strToken.length + spaces.length;
        return chalk.green(strToken + spaces);
      })
      .join("");

    // Create a detailed token info line
    const currentToken = this.tokens[this.index];
    const tokenInfo = currentToken
      ? `Current token: ${currentToken.type}::${currentToken.value}`
      : "No current token";

    return [
      "\n",
      tokenLine,
      " ".repeat(pointerOffset) + "^",
      tokenInfo,
      `Position: ${this.index + 1}/${this.tokens.length}`,
    ].join("\n");
  }

  assert(match: TokenMatcher): this {
    const token = this.get();
    cliAssert(
      token.is(match),
      () =>
        `Expected token to be ${match.toString()}, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`,
    );

    return this;
  }

  assertNext(match: TokenMatcher): this {
    const token = this.next();
    cliAssert(
      token.is(match),
      () =>
        `Expected token to be ${match.toString()}, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`,
    );

    return this;
  }

  unexpectedToken(expected: Expectations = []): never {
    const expectedString =
      typeof expected === "string"
        ? expected
        : expected.map((token) => token.toString()).join(" ");
    const token = this.get();
    cliAssert(
      false,
      () => `Unexpected ${token.type}: ${token.value} 
          ${expected.length > 0 ? ` Expected: ${expectedString}` : ""} at ${this.stringifyTokenContext()}`,
    );
  }
}

export function stringifyToken(
  token: Token,
  nextToken?: Token,
): [string, string] {
  // If there's a next token, we can calculate the space between them
  if (nextToken) {
    const spaceBetween =
      nextToken.position - (token.position + token.value.length);
    return [token.value, spaceBetween > 0 ? " ".repeat(spaceBetween) : ""];
  }
  // For the last token, just return its value
  return [token.value, ""];
}
