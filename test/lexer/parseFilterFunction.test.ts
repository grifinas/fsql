import { TokenStream } from "../../src/tokenStream";
import { parseFilterFunction } from "../../src/lexer/parseFilterFunction";
import { Token, Type } from "../../src/token";

describe("parseWhereFunction Integration tests", () => {
    it("should parse where function", () => {
        const stream = new TokenStream([
            new Token(Type.word, "column", 0),
            new Token(Type.comp, "=", 1),
            new Token(Type.word, "value", 2)
        ]);
        const filter = parseFilterFunction(stream);
        expect(filter.getLeft()).toEqual({ source: null, field: "column" });
        expect(filter.getOperator()).toBe("=");
        expect(filter.getRight()).toEqual({ source: null, field: "value" });
        expect(stream.getIndex()).toBe(stream.length);
    });
});