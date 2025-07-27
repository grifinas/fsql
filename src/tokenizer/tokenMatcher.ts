import { Type } from "@types";

export class TokenMatcher {
    constructor(
        public readonly type: Type,
        public readonly value?: string,
    ) {}

    toString(): string {
        if (this.value) return `${this.type}::${this.value}`;

        return `Any ${this.type}`;
    }
}