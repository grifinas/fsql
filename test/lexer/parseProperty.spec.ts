import { TokenStream } from "../../src/tokenStream";
import { parseProperty } from "../../src/lexer/parseProperty";
import * as parseVariableDep from "../../src/lexer/parseVariable";
import * as parseFieldDep from "../../src/lexer/parseField";
import { Token, Type } from "../../src/token";

describe("parseProperty", () => {
  const parseVariable = jest.spyOn(parseVariableDep, "parseVariable");
  const parseField = jest.spyOn(parseFieldDep, "parseField");

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should parse property with variable and field", () => {
    const stream = new TokenStream([
      new Token(Type.dot, ".", 2),
    ]);

    parseVariable.mockReturnValue("@table");
    parseField.mockReturnValue({ source: null, field: "column" });

    const result = parseProperty(stream);
    
    expect(result).toEqual({
      source: "@table",
      field: "column"
    });

    expect(parseVariable).toHaveBeenCalledWith(stream);
    expect(parseField).toHaveBeenCalledWith(stream);
  });

  it("should parse property without variable", () => {
    const stream = new TokenStream([
      new Token(Type.word, "column", 0)
    ]);

    parseVariable.mockReturnValue(null);
    parseField.mockReturnValue({ source: null, field: "column" });

    const result = parseProperty(stream);
    
    expect(result).toEqual({
      source: null,
      field: "column"
    });

    expect(parseVariable).toHaveBeenCalledWith(stream);
    expect(parseField).toHaveBeenCalledWith(stream);
  });

  it("should pass through any errors from parseVariable", () => {
    const stream = new TokenStream([
      new Token(Type.dot, ".", 2),
    ]);

    parseVariable.mockImplementation(() => {
      throw new Error("Variable error");
    });

    expect(() => parseProperty(stream)).toThrow("Variable error");
    expect(parseField).not.toHaveBeenCalled();
  });

  it("should pass through any errors from parseField", () => {
    const stream = new TokenStream([
      new Token(Type.word, "column", 0)
    ]);

    parseVariable.mockReturnValue(null);
    parseField.mockImplementation(() => {
      throw new Error("Field error");
    });

    expect(() => parseProperty(stream)).toThrow("Field error");
  });
});