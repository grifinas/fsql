import { Type } from "@types";
import { TokenMatcher } from "./tokenMatcher";

export class Token {
  constructor(
    public readonly type: Type,
    public readonly value: string,
    public readonly position: number = 0,
  ) {}

  is(matcher: TokenMatcher): boolean {
    return this.isRawEqual(matcher.type, matcher.value);
  }

  isIn(tokens: TokenMatcher[] | readonly TokenMatcher[]): boolean {
    return tokens.some((token) => this.is(token));
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
      valuesEqual =
        this.value.toLocaleLowerCase() === value.toLocaleLowerCase();
    }
    return typesEqual && valuesEqual;
  }
}
