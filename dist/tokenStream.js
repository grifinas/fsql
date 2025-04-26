"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenStream = void 0;
exports.stringifyToken = stringifyToken;
const cliAssert_1 = require("./cliAssert");
const token_1 = require("./token");
class TokenStream {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        // console.log("tokens", tokens);
    }
    get() {
        const token = this.tokens[this.index];
        if (!token) {
            throw new Error(`No token at index: ${this.index}, there are ${this.tokens.length} tokens`);
        }
        return token;
    }
    getIndexed(i) {
        const token = this.tokens[i];
        if (!token) {
            throw new Error(`No token at index: ${i}, there are ${this.tokens.length} tokens`);
        }
        return token;
    }
    next() {
        this.index++;
        return this.get();
    }
    prev() {
        this.index--;
        return this.get();
    }
    hasNext() {
        return this.tokens.length > this.index + 1;
    }
    peek(offset = 1) {
        return this.getIndexed(this.index + offset);
    }
    multiPeek(offset = 1) {
        const results = [];
        for (let i = 0; i < offset; i++) {
            results.push(this.getIndexed(this.index + i));
        }
        return results;
    }
    toString() {
        return this.tokens.map(stringifyToken).join("");
    }
    toStringFromCurrent() {
        return [...this.tokens].splice(this.index).map(stringifyToken).join("");
    }
    stringifyTokenContext(start = 5, end = 2) {
        const relevantTokens = [...this.tokens].splice(this.index - start, start + end);
        const beforeTokens = [...relevantTokens].splice(0, start);
        const length = beforeTokens.reduce((l, token) => l + stringifyToken(token).length, 0);
        const relevantLine = relevantTokens.map(stringifyToken).join("");
        return ("\n" +
            relevantLine +
            "\n" +
            " ".repeat(length) +
            "^" +
            "\n" +
            new Error().stack);
    }
    assert(type, value, caseSensitive = true) {
        const token = this.get();
        (0, cliAssert_1.cliAssert)(token.is(type, value, caseSensitive), () => `Expected token to be ${type}${value ? `::${value}` : ""}, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`);
    }
    assertNext(type, value) {
        const token = this.next();
        const typesEqual = token.type === type;
        const valuesEqual = value ? token.value === value : true;
        (0, cliAssert_1.cliAssert)(typesEqual && valuesEqual, () => `Expected token to be ${type}${value ? `::${value}` : ""}, but got: ${token.value}::${token.type} at ${this.stringifyTokenContext()}`);
    }
    unexpectedToken(where, expected) {
        const token = this.get();
        (0, cliAssert_1.cliAssert)(false, () => `Unexpected token ${where ? `in ${where}` : ""}: ${token.value}::${token.type} 
          ${expected ? ` Expected: ${expected}` : ""} at ${this.stringifyTokenContext()}`);
    }
}
exports.TokenStream = TokenStream;
function stringifyToken(token) {
    switch (token.type) {
        case token_1.Type.equals:
        case token_1.Type.word:
            return token.value + " ";
        default:
            return token.value;
    }
}
//# sourceMappingURL=tokenStream.js.map