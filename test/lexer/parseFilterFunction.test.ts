import { TokenStream } from "@src/tokenizer/tokenStream";
import { parseFilterFunction } from "@src/lexer/parseFilterFunction";
import { Token } from "@src/tokenizer/token";
import { Type } from "@src/types";
import { FieldProperty, ResolvedProperty } from "@src/entities/property";

describe("parseWhereFunction Integration tests", () => {
    it("should parse where function", () => {
        const stream = new TokenStream([
            new Token(Type.word, "column"),
            new Token(Type.comp, "="),
            new Token(Type.word, "value")
        ]);
        const filter = parseFilterFunction(stream);
        expect(filter.getLeft()).toBeInstanceOf(FieldProperty);
        expect((filter.getLeft() as FieldProperty).source).toEqual(null);
        expect((filter.getLeft() as FieldProperty).field).toEqual("column");
        expect(filter.getOperator()).toBe("=");
        expect(filter.getRight()).toBeInstanceOf(FieldProperty);
        expect((filter.getRight() as FieldProperty).source).toEqual(null);
        expect((filter.getRight() as FieldProperty).field).toEqual("value");
        expect(stream.getIndex()).toBe(stream.length);
    });

    it("should parse where function comparing a column to a string", () => {
        const stream = new TokenStream([
            new Token(Type.word, "column"),
            new Token(Type.comp, "="),
            new Token(Type.string, "value")
        ]);
        const filter = parseFilterFunction(stream);
        expect(filter.getLeft()).toBeInstanceOf(FieldProperty);
        expect((filter.getLeft() as FieldProperty).source).toEqual(null);
        expect((filter.getLeft() as FieldProperty).field).toEqual("column");
        expect(filter.getOperator()).toBe("=");
        expect(filter.getRight()).toBeInstanceOf(ResolvedProperty);
        expect((filter.getRight() as ResolvedProperty).value).toEqual("value");
        expect(stream.getIndex()).toBe(stream.length);
    });

    it("should parse where function comparing a column to a number", () => {
        const stream = new TokenStream([
            new Token(Type.word, "column"),
            new Token(Type.comp, "="),
            new Token(Type.number, "123")
        ]);
        const filter = parseFilterFunction(stream);
        expect(filter.getLeft()).toBeInstanceOf(FieldProperty);
        expect((filter.getLeft() as FieldProperty).source).toEqual(null);
        expect((filter.getLeft() as FieldProperty).field).toEqual("column");
        expect(filter.getOperator()).toBe("=");
        expect(filter.getRight()).toBeInstanceOf(ResolvedProperty);
        expect((filter.getRight() as ResolvedProperty).value).toEqual(123);
        expect(stream.getIndex()).toBe(stream.length);
    });

    it("should parse where function comparing a column to a boolean", () => {
        const stream = new TokenStream([
            new Token(Type.word, "column"),
            new Token(Type.comp, "="),
            new Token(Type.word, "true")
        ]);
        const filter = parseFilterFunction(stream);
        expect(filter.getLeft()).toBeInstanceOf(FieldProperty);
        expect((filter.getLeft() as FieldProperty).source).toEqual(null);
        expect((filter.getLeft() as FieldProperty).field).toEqual("column");
        expect(filter.getOperator()).toBe("=");
        expect(filter.getRight()).toBeInstanceOf(ResolvedProperty);
        expect((filter.getRight() as ResolvedProperty).value).toEqual(true);
        expect(stream.getIndex()).toBe(stream.length);
    });

    it("should parse where function that does not have an operator (implicit boolean comparison)", () => {
        const stream = new TokenStream([
            new Token(Type.word, "column"),
            new Token(Type.word, "ORDER"),
            new Token(Type.word, "BY"),
        ]);
        const filter = parseFilterFunction(stream);
        expect(filter.getLeft()).toBeInstanceOf(FieldProperty);
        expect((filter.getLeft() as FieldProperty).source).toEqual(null);
        expect((filter.getLeft() as FieldProperty).field).toEqual("column");
        expect(filter.getOperator()).toBe("=");
        expect(filter.getRight()).toBeInstanceOf(ResolvedProperty);
        expect((filter.getRight() as ResolvedProperty).value).toEqual(true);
        expect(stream.getIndex()).toBe(1);
    });

    it("should parse where function that just ends (implicit boolean comparison)", () => {
        const stream = new TokenStream([
            new Token(Type.word, "column"),
        ]);
        const filter = parseFilterFunction(stream);
        expect(filter.getLeft()).toBeInstanceOf(FieldProperty);
        expect((filter.getLeft() as FieldProperty).source).toEqual(null);
        expect((filter.getLeft() as FieldProperty).field).toEqual("column");
        expect(filter.getOperator()).toBe("=");
        expect(filter.getRight()).toBeInstanceOf(ResolvedProperty);
        expect((filter.getRight() as ResolvedProperty).value).toEqual(true);
        expect(stream.getIndex()).toBe(stream.length);
    });
});