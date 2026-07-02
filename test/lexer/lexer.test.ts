import { lex } from "@src/lexer/lexer";
import { AST } from "@src/data/ast";
import { FilterFunction } from "@src/entities/filterFunction";
import { FieldProperty, FunctionProperty } from "@src/entities/property";
import { tokenize } from "@src/tokenizer/tokenizer";
import { TokenStream } from "@src/tokenizer/tokenStream";
import { Token } from "@src/tokenizer/token";
import { Type } from "@src/types";

describe("lexer", () => {
  it("should expose lex function", () => {
    expect(typeof lex).toBe("function");
  });

  it("should lex simple select statement", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere"));
    expect(ast.all).toBe(true);
    expect(ast.fields).toEqual([]);
    expect(ast.mainfile?.ref()).toBe("fileNameGoesHere");
    expect(Object.keys(ast.joinFiles)).toEqual([]);
    expect(ast.order).toBe(undefined);
    expect(ast.next).toBeNull();
  });

  it("should lex file with hyphens", () => {
    const ast = lex(tokenize("SELECT * from file-name-goes-here"));
    expect(ast.mainfile?.ref()).toBe("file-name-goes-here");
  });

  it("should lex file with underscores", () => {
    const ast = lex(tokenize("SELECT * from file_name_goes_here"));
    expect(ast.mainfile?.ref()).toBe("file_name_goes_here");
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
      tokenize(`SELECT *
                from file_name_goes_here
                         JOIN ${files.join(" JOIN ")}`),
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
        `SELECT *
         from file_name_goes_here
         where ${conditions.join(" AND ")}`,
      ),
    );

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
      tokenize("SELECT * from file_name_goes_here JOIN foo ORDER BY date ASC"),
    );
    expect(ast.order).toEqual(["date", 1]);
    expect(Object.keys(ast.joinFiles)).toEqual(["foo"]);
  });

  it("should lex WHERE and ORDER BY clauses together", () => {
    const ast = lex(
      tokenize(
        "SELECT * from file_name_goes_here WHERE foo>1 ORDER BY date DESC",
      ),
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
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'foo'),
      new FieldProperty(null, 'bar'),
    ]);
  });

  it("should handle column aliasing with AS keyword", () => {
    const ast = lex(tokenize("SELECT foo as f, bar as b from fileNameGoesHere"));
    expect(ast.all).toBe(false);
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'foo').setAlias('f'),
      new FieldProperty(null, 'bar').setAlias('b'),
    ]);
  });

  it("should set 'mainfile' to whatever is in FROM", () => {
    const ast = lex(tokenize("SELECT foo, bar from fileNameGoesHere"));
    expect(ast.mainfile?.ref()).toBe("fileNameGoesHere");
  });

  it("should set 'joinFiles' to whatever is in JOIN", () => {
    const ast = lex(
      tokenize("SELECT * from fileNameGoesHere JOIN first JOIN second"),
    );
    expect(Object.keys(ast.joinFiles)).toEqual(["first", "second"]);
  });

  it("should set order when ORDER BY is specified", () => {
    const ast = lex(
      tokenize("SELECT * from fileNameGoesHere ORDER BY foo ASC"),
    );
    expect(ast.order).toEqual(["foo", 1]);
  });

  it("should set next when semicolon is specified and more tokens exist after semicolon", () => {
    const ast = lex(
      tokenize("SELECT * from fileNameGoesHere; SELECT * from fileNameGoesThere"),
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
    expect(ast.into?.ref()).toBe("@var");
  })

  it("should allow selecting from variables", () => {
    const ast = lex(tokenize("SELECT * from @var"));
    expect(ast.mainfile?.ref()).toBe("@var");
  });

  it("should allow joining from variables", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere JOIN @var"));
    expect(Object.keys(ast.joinFiles)).toEqual(["@var"]);
  });

  it("should allow using SQL functions in WHERE", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere WHERE UPPER(foo) = foo"));
    expect(ast.where?.isEmpty()).toBe(false);
    expect(ast.where?.getLeft()).toBeInstanceOf(FunctionProperty);
    expect(ast.where?.getRight()).toBeInstanceOf(FieldProperty);
    expect(ast.where?.getOperator()).toBe("=");
  });

  it("should allow nesting SQL functions in WHERE", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere WHERE UPPER(LOWER(foo)) = foo"));
    expect(ast.where?.isEmpty()).toBe(false);
    expect(ast.where?.getLeft()).toBeInstanceOf(FunctionProperty);
    expect(ast.where?.getRight()).toBeInstanceOf(FieldProperty);
    expect(ast.where?.getOperator()).toBe("=");
  });

  it("should lex LIMIT clause", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere LIMIT 10"));
    expect(ast.limit).toBe(10);
    expect(ast.offset).toBe(0);
  });

  it("should lex OFFSET clause", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere OFFSET 5"));
    expect(ast.limit).toBe(undefined);
    expect(ast.offset).toBe(5);
  });

  it("should lex LIMIT and OFFSET together", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere LIMIT 10 OFFSET 5"));
    expect(ast.limit).toBe(10);
    expect(ast.offset).toBe(5);
  });

  it("should lex GROUP BY with single field", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere GROUP BY category"));
    expect(ast.groupBy).toEqual([
      expect.objectContaining({
        field: "category",
      }),
    ]);
  });

  it("should lex GROUP BY with multiple fields", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere GROUP BY category, status, region"));
    expect(ast.groupBy).toEqual([
      expect.objectContaining({
        field: "category",
      })
      , expect.objectContaining({
        field: "status",
      }), expect.objectContaining({
        field: "region",
      })]);
  });

  it("should lex GROUP BY with other clauses", () => {
    const ast = lex(tokenize("SELECT * from fileNameGoesHere WHERE active=true GROUP BY category ORDER BY name ASC"));
    expect(ast.groupBy).toEqual([expect.objectContaining({
      field: "category",
    })]);
    expect(ast.where?.isEmpty()).toBe(false);
    expect(ast.order).toEqual(["name", 1]);
  });

  describe("optional FROM clause", () => {
    it("should parse query without FROM clause", () => {
      const stream = new TokenStream([
        new Token(Type.word, "SELECT"),
        new Token(Type.word, "NOW"),
        new Token(Type.parenthesis, "("),
        new Token(Type.parenthesis, ")"),
      ]);
      const ast = lex(stream);
      expect(ast.mainfile).toBeUndefined();
      expect(ast.all).toBe(false);
    });

    it("should throw when using WHERE without FROM", () => {
      const stream = new TokenStream([
        new Token(Type.word, "SELECT"),
        new Token(Type.word, "col"),
        new Token(Type.word, "WHERE"),
        new Token(Type.word, "id"),
        new Token(Type.equals, "="),
        new Token(Type.number, "1"),
      ]);
      //TODO better errors
      expect(() => lex(stream)).toThrow();
    });

    it("should throw when using ORDER BY without FROM", () => {
      const stream = new TokenStream([
        new Token(Type.word, "SELECT"),
        new Token(Type.word, "col"),
        new Token(Type.word, "ORDER"),
        new Token(Type.word, "BY"),
        new Token(Type.word, "name"),
        new Token(Type.word, "DESC"),
      ]);
      expect(() => lex(stream)).toThrow();
    });

    it("should parse query with multiple functions", () => {
      const stream = new TokenStream([
        new Token(Type.word, "SELECT"),
        new Token(Type.word, "NOW"),
        new Token(Type.parenthesis, "("),
        new Token(Type.parenthesis, ")"),
        new Token(Type.comma, ","),
        new Token(Type.word, "VERSION"),
        new Token(Type.parenthesis, "("),
        new Token(Type.parenthesis, ")"),
      ]);
      const ast = lex(stream);
      expect(ast.mainfile).toBeUndefined();
      expect(ast.fields?.length).toBe(2);
    });

    it("should parse multiple statements with and without FROM", () => {
      const stream = new TokenStream([
        new Token(Type.word, "SELECT"),
        new Token(Type.word, "NOW"),
        new Token(Type.parenthesis, "("),
        new Token(Type.parenthesis, ")"),
        new Token(Type.semicolon, ";"),
        new Token(Type.word, "SELECT"),
        new Token(Type.special, "*"),
        new Token(Type.word, "FROM"),
        new Token(Type.word, "data.json"),
      ]);
      const ast = lex(stream);
      expect(ast.mainfile).toBeUndefined();
      expect(ast.next).toBeDefined();
      expect(ast.next?.mainfile).toBeDefined();
      expect(ast.next?.mainfile?.ref()).toBe("data.json");
    });
  });
});
