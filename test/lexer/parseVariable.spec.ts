import { TokenStream } from "../../src/tokenStream";
import { parseVariable } from "../../src/lexer/parseVariable";
import { Type, Token } from "../../src/token";

describe("parseVariable", () => {
  it("should parse a variable starting with @", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@", 0),
      new Token(Type.word, "foo", 1)
    ]);
    expect(parseVariable(stream)).toBe("@foo");
  });

  it("should return null if token is not @", () => {
    const stream = new TokenStream([
      new Token(Type.special, "#", 0),
      new Token(Type.word, "foo", 1)
    ]);
    expect(parseVariable(stream)).toBeNull();
  });

  it("should throw error if @ is not followed by word", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@", 0),
      new Token(Type.number, "123", 1)
    ]);
    expect(() => parseVariable(stream)).toThrow();
  });

  it("should not consume tokens if not a variable", () => {
    const stream = new TokenStream([
      new Token(Type.special, "#", 0),
      new Token(Type.word, "foo", 1)
    ]);
    parseVariable(stream);
    expect(stream.get().is(Type.special, "#")).toBe(true);
    expect(stream.peek().is(Type.word, "foo")).toBe(true);
  });

  it("should consume both tokens for valid variable", () => {
    const stream = new TokenStream([
      new Token(Type.special, "@", 0),
      new Token(Type.word, "foo", 1),
      new Token(Type.special, ".", 2)
    ]);
    parseVariable(stream);
    expect(stream.get().is(Type.special, ".")).toBe(true);
  });
});
