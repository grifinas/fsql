import { TokenStream } from "../../src/tokenStream";
import { parseVariable } from "../../src/lexer/parseVariable";
import { Token } from "../../src/token";
import { Type } from "../../src/types";

describe("parseVariable", () => {
  it("should parse a variable starting with @", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@"),
      new Token(Type.word, "foo")
    ]);
    expect(parseVariable(stream)).toBe("@foo");
  });

  it("should return null if token is not @", () => {
    const stream = new TokenStream([
      new Token(Type.special, "#"),
      new Token(Type.word, "foo")
    ]);
    expect(parseVariable(stream)).toBeNull();
  });

  it("should throw error if @ is not followed by word/number", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@"),
      new Token(Type.dot, ".")
    ]);
    expect(() => parseVariable(stream)).toThrow();
  });

  it("should not consume tokens if not a variable", () => {
    const stream = new TokenStream([
      new Token(Type.special, "#"),
      new Token(Type.word, "foo")
    ]);
    parseVariable(stream);
    expect(stream.get().is(Type.special, "#")).toBe(true);
    expect(stream.peek().is(Type.word, "foo")).toBe(true);
  });

  it("should consume both tokens for valid variable", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@"),
      new Token(Type.word, "foo"),
      new Token(Type.special, ".")
    ]);
    parseVariable(stream);
    expect(stream.get().is(Type.special, ".")).toBe(true);
  });

  it("should parse variable with number", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@"),
      new Token(Type.number, "123"),
    ]);
    expect(parseVariable(stream)).toBe("@123");
  });
});
