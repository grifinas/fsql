export class Token {
  constructor(
    public readonly type: Type,
    public readonly value: string,
    public readonly position: number
  ) {}

  is(type: Type, value?: string): boolean {
    const typesEqual = this.type === type;
    let valuesEqual = true;
    if (value) {
        valuesEqual = this.value.toLocaleLowerCase() === value.toLocaleLowerCase();
    }
    return typesEqual && valuesEqual;
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
