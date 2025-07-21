import { TokenStream } from "../../src/tokenStream";
import { parseProperty } from "../../src/lexer/parseProperty";
import { Token, Type } from "../../src/token";

describe("parseProperty Integration tests", () => {
  it("should parse property with variable and field", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@", 0),
      new Token(Type.word, "table", 1),
      new Token(Type.dot, ".", 2),
      new Token(Type.word, "column", 3)
    ]);
    expect(parseProperty(stream)).toEqual({ source: "@table", field: "column" });
    expect(stream.getIndex()).toBe(stream.length);
  });
})