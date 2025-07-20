import { cliAssert } from "./cliAssert";
import { Token, Type } from "./token";

export class TokenStream {
  private index: number = -1;

  constructor(private readonly tokens: Token[]) {
  }

  get length(): number {
    return this.tokens.length;
  }

  get(): Token {
    //Index starts counting from -1 just so while(stream.hasNext()) stream.next() would work propperly
    if (this.index < 0) this.index = 0;
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

  advanceIf(type: Type, value?: string) {
    if (this.done()) return false;
    if (this.get().is(type, value)) {
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

  next(): Token {
    this.index++;
    return this.get();
  }

  prev(): Token {
    this.index--;
    return this.get();
  }

  done(): boolean {
    return this.index >= this.tokens.length;
  }

  hasNext(): boolean {
    return this.tokens.length > this.index + 1;
  }

  peek(offset: number = 1): Token {
    return this.getIndexed(this.index + offset);
  }

  popNextIf(type: Type, value?: string): boolean {
    if (!this.hasNext()) {
      return false;
    };
    if (this.peek().is(type, value)) {
      this.next();
      return true;
    }
    return false;
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
    //TODO feels very off
    if (this.index < 0) this.index = 0;
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

  assert(type: Type, value?: string): this {
    const token = this.get();
    cliAssert(
      token.is(type, value),
      () =>
        `Expected token to be ${type}${value ? `::${value}` : ""
        }, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`
    );

    return this;
  }

  assertNext(type: Token["type"], value?: string): this {
    const token = this.next();
    cliAssert(
      token.is(type, value),
      () =>
        `Expected token to be ${type}${value ? `::${value}` : ""
        }, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`
    );

    return this;
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
