import { TokenStream } from "../../src/tokenStream";
import { parseField } from "../../src/lexer/parseField";
import { Type } from "../../src/token";
import { Token } from "../../src/token";
import { FieldProperty, FunctionProperty, ResolvedProperty } from "../../src/property";

describe("parseField", () => {
  it("should parse a single word field", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo")
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual(null);
    expect((result as FieldProperty).field).toEqual("foo");
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should parse dot-separated fields", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo"),
      new Token(Type.dot, "."),
      new Token(Type.word, "bar")
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual(null);
    expect((result as FieldProperty).field).toEqual("foo.bar");
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should parse multiple dot-separated fields", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo"),
      new Token(Type.dot, "."),
      new Token(Type.word, "bar"),
      new Token(Type.dot, "."),
      new Token(Type.word, "baz")
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual(null);
    expect((result as FieldProperty).field).toEqual("foo.bar.baz");
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should understand that you cant have two words in a row in a field", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo"),
      new Token(Type.word, "FROM")
    ]);

    const result = parseField(stream);
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual(null);
    expect((result as FieldProperty).field).toEqual("foo");
    expect(stream.get().is(Type.word, 'FROM')).toBe(true);
  });

  it("should throw error if not starting with word", () => {
    const stream = new TokenStream([
      new Token(Type.dot, "."),
      new Token(Type.word, "foo")
    ]);
    expect(() => parseField(stream)).toThrow();
  });

  it("should throw error if dot is not followed by word", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo"),
      new Token(Type.dot, "."),
      new Token(Type.dot, ".")
    ]);
    expect(() => parseField(stream)).toThrow();
  });

  it("should consume all tokens in field", () => {
    const stream = new TokenStream([
      new Token(Type.word, "foo"),
      new Token(Type.dot, "."),
      new Token(Type.word, "bar"),
      new Token(Type.comma, ",")
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual(null);
    expect((result as FieldProperty).field).toEqual("foo.bar");
    expect(stream.getIndex()).toBe(stream.length - 1);
  });

  it("should return number if a number is passed", () => {
    const stream = new TokenStream([
      new Token(Type.number, '1')
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(ResolvedProperty);
    expect((result as ResolvedProperty).value).toEqual(1);
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should return boolean if a boolean is passed", () => {
    const stream = new TokenStream([
      new Token(Type.word, 'true')
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(ResolvedProperty);
    expect((result as ResolvedProperty).value).toEqual(true);
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should return stringify booleans and numbers if it is part of the name", () => {
    const stream = new TokenStream([
      new Token(Type.word, 'foo'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'true'),
      new Token(Type.dot, '.'),
      new Token(Type.number, '1')
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual(null);
    expect((result as FieldProperty).field).toEqual('foo.true.1');
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should parse string literals", () => {
    const stream = new TokenStream([
      new Token(Type.string, 'foo')
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(ResolvedProperty);
    expect((result as ResolvedProperty).value).toEqual('foo');
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should parse functions", () => {
    const stream = new TokenStream([
      new Token(Type.word, 'fname'),
      new Token(Type.parenthesis, '('),
      new Token(Type.word, 'arg1'),
      new Token(Type.comma, ','),
      new Token(Type.word, 'arg2'),
      new Token(Type.parenthesis, ')')
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(FunctionProperty);
    expect((result as FunctionProperty).name).toEqual('fname');
    expect((result as FunctionProperty).args).toEqual([new FieldProperty(null, 'arg1'), new FieldProperty(null, 'arg2')]);
    expect(stream.getIndex()).toBe(stream.length);
  });

  it("should be able to nest functions", () => {
    const stream = new TokenStream([
      new Token(Type.word, 'fname'),
      new Token(Type.parenthesis, '('),
      new Token(Type.word, 'f2name'),
      new Token(Type.parenthesis, '('),
      new Token(Type.word, 'arg1'),
      new Token(Type.parenthesis, ')'),
      new Token(Type.comma, ','),
      new Token(Type.word, 'arg2'),
      new Token(Type.parenthesis, ')')
    ]);
    const result = parseField(stream);
    expect(result).toBeInstanceOf(FunctionProperty);
    expect((result as FunctionProperty).name).toEqual('fname');
    expect((result as FunctionProperty).args).toEqual([new FunctionProperty('f2name', [new FieldProperty(null, 'arg1')]), new FieldProperty(null, 'arg2')]);
    expect(stream.getIndex()).toBe(stream.length);
  });
});
