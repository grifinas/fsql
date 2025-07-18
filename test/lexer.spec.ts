import { tokenize } from "../src/tokenizer";
import { lex } from "../src/lexer/lexer";
import { AST } from "../src/ast";
import { FilterFunction } from "../src/filterFunction";

/*
 * Tested together with parser cause that's how it makes sense, If tokenize tests don't pass don't even look here
 */
describe("lexer", () => {
  it("should expose lex function", () => {
    expect(typeof lex).toBe("function");
  });

  it("should lex simple select statement", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere"));
    expect(ast.all).toBe(true);
    expect(ast.fields).toEqual([]);
    expect(ast.mainfile?.field).toBe("fileNameGoesHere");
    expect(Object.keys(ast.joinFiles)).toEqual([]);
    expect(ast.order).toBe(undefined);
    expect(ast.next).toBeNull();
  });

  it("should lex file with hyphens", () => {
    const ast = lex(tokenize("SELECT * from file-name-goes-here"));
    expect(ast.mainfile?.field).toBe("file-name-goes-here");
  });

  it("should lex file with underscores", () => {
    const ast = lex(tokenize("SELECT * from file_name_goes_here"));
    expect(ast.mainfile?.field).toBe("file_name_goes_here");
  });

  it("should lex JOIN clause", () => {
    const ast = lex(tokenize("SELECT * from file_name_goes_here JOIN file-name-goes-here"));
    expect(Object.keys(ast.joinFiles)).toEqual(["file-name-goes-here"]);
  });

  it("Join clauses should loop infinitely", () => {
    const files = [
      "file-name-goes-here",
      "fileNameGoesHere",
      "foo",
      "bar",
      "baz",
    ];

    const ast = lex(
      tokenize(`SELECT * from file_name_goes_here JOIN ${files.join(" JOIN ")}`)
    );
    expect(Object.keys(ast.joinFiles)).toEqual(files);
  });

  it("should lex WHERE clause", () => {
    const ast = lex(tokenize("SELECT * from file_name_goes_here where a=b"));
    expect(ast.where?.isEmpty()).toBe(false);
  });

  it("WHERE clauses should be chainable with AND", () => {
    const conditions = ["a=b", "c=d", "d=a"];
    const ast = lex(
      tokenize(
        `SELECT * from file_name_goes_here where ${conditions.join(" AND ")}`
      )
    );

    console.log(ast.where);
    expect(ast.where?.getLeft()).toBeInstanceOf(FilterFunction);
    expect(ast.where?.getRight()).toBeInstanceOf(FilterFunction);
    expect(ast.where?.getOperator()).toBe("=");
  });

  it("should lex JOIN and WHERE clauses together", () => {
    const ast = lex(tokenize("SELECT * from file_name_goes_here JOIN foo where q=b"));
    expect(ast.where?.isEmpty()).toBe(false);
    expect(Object.keys(ast.joinFiles)).toEqual(["foo"]);
  });

  it("should lex ORDER BY", () => {
    const ast = lex(tokenize("SELECT * from file_name_goes_here ORDER BY date ASC"));
    expect(ast.order).toEqual(["date", 1]);
  });

  it("should lex JOIN and ORDER BY clauses together", () => {
    const ast = lex(
      tokenize("SELECT * from file_name_goes_here JOIN foo ORDER BY date ASC")
    );
    expect(ast.order).toEqual(["date", 1]);
    expect(Object.keys(ast.joinFiles)).toEqual(["foo"]);
  });

  it("should lex WHERE and ORDER BY clauses together", () => {
    const ast = lex(
      tokenize(
        "SELECT * from file_name_goes_here WHERE foo>1 ORDER BY date DESC"
      )
    );
    expect(ast.where?.isEmpty()).toBe(false);
    expect(ast.order).toEqual(["date", -1]);
  });

  it("should keep 'all' as true when SELECT *", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere"));
    expect(ast.all).toBe(true);
    expect(ast.fields).toEqual([]);
  });

  it("should set fields with aliases when SELECT foo, bar", () => {
    const ast = lex(tokenize("SELECT foo, bar from fileNameGoesHere"));
    expect(ast.all).toBe(false);
    expect(ast.fields).toEqual([{ field: "foo", alias: "foo" }, { field: "bar", alias: "bar" }]);
  });

  it("should handle column aliasing with AS keyword", () => {
    const ast = lex(tokenize("SELECT foo as f, bar as b from fileNameGoesHere"));
    expect(ast.all).toBe(false);
    expect(ast.fields).toEqual([{ field: "foo", alias: "f" }, { field: "bar", alias: "b" }]);
  });

  it("should set 'mainfile' to whatever is in FROM", () => {
    const ast = lex(tokenize("SELECT foo, bar from fileNameGoesHere"));
    expect(ast.mainfile?.field).toBe("fileNameGoesHere");
  });

  it("should set 'joinFiles' to whatever is in JOIN", () => {
    const ast = lex(
      tokenize("SELECT * from fileNameGoesHere JOIN first JOIN second")
    );
    expect(Object.keys(ast.joinFiles)).toEqual(["first", "second"]);
  });

  it("should set order when ORDER BY is specified", () => {
    const ast = lex(
      tokenize("SELECT * from fileNameGoesHere ORDER BY foo ASC")
    );
    expect(ast.order).toEqual(["foo", 1]);
  });

  it("should set next when semicolon is specified and more tokens exist after semicolon", () => {
    const ast = lex(
      tokenize("SELECT * from fileNameGoesHere; SELECT * from fileNameGoesThere")
    );
    expect(ast.next).toBeInstanceOf(AST);
  });

  it("should not set next when no semicolon is specified", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere"));
    expect(ast.next).toBeNull();
  });

  it("should not set next when semicolon is the last token", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere;"));
    expect(ast.next).toBeNull();
  });

  it("should allow setting variables with INTO keyword", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere INTO @var"));
    expect(ast.intoName).toBe("@var");
  })

  it("should allow selecting from variables", () => {
    const ast = lex(tokenize("SELECT * from @var"));
    expect(ast.mainfile?.field).toBe("@var");
    expect(ast.mainfile?.alias).toBe("@var");
  });

  it("should allow joining from variables", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere JOIN @var"));
    expect(Object.keys(ast.joinFiles)).toEqual(["@var"]);
  });
});
