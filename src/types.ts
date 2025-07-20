export interface IAlias {
    setAlias(alias: string): IAlias;
    getAlias(): string | null;
}

export interface IRef {
    ref(): string;
}

export type Scalar = string | number | boolean;