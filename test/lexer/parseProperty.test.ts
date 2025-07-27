import { TokenStream } from "../../src/tokenizer/tokenStream";
import { parseProperty } from "../../src/lexer/parseProperty";
import { Token } from "../../src/tokenizer/token";
import { Type } from "../../src/types";
import { FieldProperty } from "../../src/entities/property";

describe("parseProperty Integration tests", () => {
  it("should parse property with variable and field", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@"),
      new Token(Type.word, "table"),
      new Token(Type.dot, "."),
      new Token(Type.word, "column")
    ]);
    const result = parseProperty(stream);
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual("@table");
    expect((result as FieldProperty).field).toEqual("column");
    expect(stream.getIndex()).toBe(stream.length);
  });
})