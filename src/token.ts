import { TokenMatcher } from "./tokenMatcher";
import { Type } from "./types";
import { logger } from "./utils/logger";

export class Token {
  constructor(
    public readonly type: Type,
    public readonly value: string,
  ) {}

  is(token: TokenMatcher): boolean;
  is(type: Type, value?: string): boolean;
  is(type: Type | TokenMatcher, value?: string): boolean {
    const result = type instanceof TokenMatcher ? this.isRawEqual(type.type, type.value) : this.isRawEqual(type, value);
    logger.debug(`Token ${this.value} is ${type.toString()} ${result}`);
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

  private isRawEqual(type: Type , value?: string): boolean {
    const typesEqual = this.type === type;
    let valuesEqual = true;
    if (value) {
        valuesEqual = this.value.toLocaleLowerCase() === value.toLocaleLowerCase();
    }
    return typesEqual && valuesEqual;
  }
}