import { Type } from "./types";

export class TokenMatcher {
    constructor(
        public readonly type: Type,
        public readonly value?: string,
    ) {}

    toString(): string {
        return `${this.type}${this.value ? `::${this.value}` : ""}`;
    }
}