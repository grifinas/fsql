export class Token {
  constructor(
    public readonly type: Type,
    public readonly value: string,
  ) {}

  is(token: Token): boolean;
  is(type: Type, value?: string): boolean;
  is(type: Type | Token, value?: string): boolean {
    if (type instanceof Token) {
      return this.isRawEqual(type.type, type.value);
    } else {
      return this.isRawEqual(type, value);
    }
    
  }

  isIn(tokens: Token[] | readonly Token[]): boolean {
    return tokens.some(token => this.is(token.type, token.value));
  }

  isNot(token: Token): boolean {
    return !this.is(token.type, token.value);
  }

  isNotIn(tokens: Token[] | readonly Token[]): boolean {
    return !tokens.some(token => this.is(token.type, token.value));
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
  paren = "paren",
  special = "special",
  dot = "dot",
  comma = "comma",
  semicolon = "semicolon",
  equals = "equals",
  comp = "comp",
}
