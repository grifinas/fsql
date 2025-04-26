export class Token {
  constructor(
    public readonly type: Type,
    public readonly value: string,
    public readonly position: number
  ) {}

  is(type: Type, value?: string, caseSensitive = true): boolean {
    const typesEqual = this.type === type;
    let valuesEqual = true;
    if (value) {
        valuesEqual = caseSensitive ? this.value === value : this.value.toLocaleLowerCase() === value.toLocaleLowerCase();
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
