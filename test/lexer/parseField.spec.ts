import { TokenStream } from "../../src/tokenStream";
import { parseField } from "../../src/lexer/parseField";
import { Type } from "../../src/token";
import { Token } from "../../src/token";

describe("parseField", () => {
  it("should parse a single word field", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo", 0)
    ]);
    expect(parseField(stream)).toEqual({ source: null, field: "foo" });
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should parse dot-separated fields", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo", 0),
      new Token(Type.dot, ".", 1),
      new Token(Type.word, "bar", 2)
    ]);
    expect(parseField(stream)).toEqual({ source: null, field: "foo.bar" });
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should parse multiple dot-separated fields", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo", 0),
      new Token(Type.dot, ".", 1),
      new Token(Type.word, "bar", 2),
      new Token(Type.dot, ".", 3),
      new Token(Type.word, "baz", 4)
    ]); 
    expect(parseField(stream)).toEqual({ source: null, field: "foo.bar.baz" });
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should throw error if not starting with word", () => {
    const stream = new TokenStream([
      new Token(Type.dot, ".", 0),
      new Token(Type.word, "foo", 1)
    ]);
    expect(() => parseField(stream)).toThrow();
  });

  it("should throw error if dot is not followed by word", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo", 0),
      new Token(Type.dot, ".", 1),
      new Token(Type.dot, ".", 2)
    ]);
    expect(() => parseField(stream)).toThrow();
  });

  it("should consume all tokens in field", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo", 0),
      new Token(Type.dot, ".", 1),
      new Token(Type.word, "bar", 2),
      new Token(Type.comma, ",", 3)
    ]);
    parseField(stream);
    expect(stream.getIndex()).toBe(stream.length - 1);
  });

  it("should return number if a number is passed", () => {
    const stream = new TokenStream([
      new Token(Type.number, '1', 0)
    ]);
    expect(parseField(stream)).toEqual({ value: 1 });
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should return boolean if a boolean is passed", () => {
    const stream = new TokenStream([
      new Token(Type.word, 'true', 0)
    ]);
    expect(parseField(stream)).toEqual({ value: true });
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should return stringify booleans and numbers if it is part of the name", () => {
    const stream = new TokenStream([
      new Token(Type.word, 'foo', 0),
      new Token(Type.dot, '.', 1),
      new Token(Type.word, 'true', 2),
      new Token(Type.dot, '.', 3),
      new Token(Type.number, '1', 4)
    ]);
    expect(parseField(stream)).toEqual({ source: null, field: 'foo.true.1' });
    expect(stream.getIndex()).toBe(stream.length);
  });
});
