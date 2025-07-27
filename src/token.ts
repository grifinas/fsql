import { TokenMatcher } from "./tokenMatcher";
import { Type } from "./types";

export class Token {
  constructor(
    public readonly type: Type,
    public readonly value: string,
  ) {}

  is(matcher: TokenMatcher): boolean {
    const result = this.isRawEqual(matcher.type, matcher.value);
    return result;
  }

  isIn(tokens: TokenMatcher[] | readonly TokenMatcher[]): boolean {
    return tokens.some(token => this.is(token));
  }

  isNot(token: TokenMatcher): boolean {
    return !this.is(token);
  }

  isNotIn(tokens: TokenMatcher[] | readonly TokenMatcher[]): boolean {
    return !this.isIn(tokens);
  }

  private isRawEqual(type: Type, value?: string): boolean {
    const typesEqual = this.type === type;
    let valuesEqual = true;
    if (value) {
      valuesEqual = this.value.toLocaleLowerCase() === value.toLocaleLowerCase();
    }
    return typesEqual && valuesEqual;
  }
}