import { TokenStream } from "../../src/tokenStream";
import { parseProperty } from "../../src/lexer/parseProperty";
import * as parseVariableDep from "../../src/lexer/parseVariable";
import * as parseFieldDep from "../../src/lexer/parseField";
import { Token, Type } from "../../src/token";
import { FieldProperty } from "../../src/property";

describe("parseProperty", () => {
  const parseVariable = jest.spyOn(parseVariableDep, "parseVariable");
  const parseField = jest.spyOn(parseFieldDep, "parseField");

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should parse property with variable and field", () => {
    const stream = new TokenStream([
      new Token(Type.dot, "."),
    ]);

    parseVariable.mockReturnValue("@table");
    parseField.mockReturnValue(new FieldProperty(null, "column"));

    const result = parseProperty(stream);
    
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual("@table");
    expect((result as FieldProperty).field).toEqual("column");

    expect(parseVariable).toHaveBeenCalledWith(stream);
    expect(parseField).toHaveBeenCalledWith(stream);
  });

  it("should parse property without variable", () => {
    const stream = new TokenStream([
      new Token(Type.word, "column")
    ]);

    parseVariable.mockReturnValue(null);
    parseField.mockReturnValue(new FieldProperty(null, "column"));

    const result = parseProperty(stream);
    
    expect(result).toBeInstanceOf(FieldProperty);
    expect((result as FieldProperty).source).toEqual(null);
    expect((result as FieldProperty).field).toEqual("column");

    expect(parseVariable).toHaveBeenCalledWith(stream);
    expect(parseField).toHaveBeenCalledWith(stream);
  });

  it("should pass through any errors from parseVariable", () => {
    const stream = new TokenStream([
      new Token(Type.dot, "."),
    ]);

    parseVariable.mockImplementation(() => {
      throw new Error("Variable error");
    });

    expect(() => parseProperty(stream)).toThrow("Variable error");
    expect(parseField).not.toHaveBeenCalled();
  });

  it("should pass through any errors from parseField", () => {
    const stream = new TokenStream([
      new Token(Type.word, "column")
    ]);

    parseVariable.mockReturnValue(null);
    parseField.mockImplementation(() => {
      throw new Error("Field error");
    });

    expect(() => parseProperty(stream)).toThrow("Field error");
  });
});