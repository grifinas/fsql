interface TokenMatcher {
  type: Type;
  value?: string;
}

export class Token implements TokenMatcher {
  constructor(
    public readonly type: Type,
    public readonly value: string,
  ) {}

  is(token: TokenMatcher): boolean;
  is(type: Type, value?: string): boolean;
  is(type: Type | TokenMatcher, value?: string): boolean {
    if (typeof type === 'object') {
      return this.isRawEqual(type.type, type.value);
    } else {
      return this.isRawEqual(type, value);
    }
    
  }

  isIn(tokens: TokenMatcher[] | readonly TokenMatcher[]): boolean {
    return tokens.some(token => this.is(token));
  }

  isNot(token: TokenMatcher): boolean {
    return !this.is(token);
  }

  isNotIn(tokens: TokenMatcher[] | readonly TokenMatcher[]): boolean {
    return !tokens.some(token => this.is(token));
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

export enum Type {
  word = "word",
  number = "number",
  bracket = "bracket",
  brace = "brace",
  parenthesis = "parenthesis",
  special = "special",
  dot = "dot",
  comma = "comma",
  semicolon = "semicolon",
  equals = "equals",
  comp = "comp",
}
