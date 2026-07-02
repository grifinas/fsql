export interface IAlias {
    setAlias(alias: string): IAlias;
    getAlias(): string | null;
}

export interface IRef {
    ref(): string;
}

export type Scalar = string | number | boolean;

export enum Type {
    word = "word",
    string = "string",
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

export interface MeshedRow {
    [sourceRef: string]: object;
}
