import { parseSelectArgs } from '../../src/lexer/parseSelectArgs';
import { AST } from '../../src/ast';
import { TokenStream } from '../../src/tokenStream';
import { Token } from '../../src/token';
import { Type } from '../../src/types';
import { FieldProperty } from '../../src/property';

describe('parseSelectArgs - Integration Tests', () => {
  let ast: AST;
  let stream: TokenStream;

  beforeEach(() => {
    ast = new AST(); // Resets AST for each test
  });

  it('should handle SELECT *', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.special, '*'),
      new Token(Type.word, 'FROM'),
    ]);
    parseSelectArgs(ast, stream);
    expect(ast.fields).toEqual([]); // Or expect(ast.all).toBe(true) if AST has such a flag
    expect(ast.all).toBe(true); // Based on how addField("*") would work or if it sets a flag
    expect(stream.get().value).toBe('FROM'); // Stream should be at FROM
  });

  it('should parse a single field: SELECT fieldA', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.word, 'FROM'),
    ]);
    parseSelectArgs(ast, stream);
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'fieldA'),
    ]);
    expect(stream.get().value).toBe('FROM');
  });

  it('should parse a single field with alias: SELECT fieldA AS aliasA', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.word, 'AS'),
      new Token(Type.word, 'aliasA'),
      new Token(Type.word, 'FROM'),
    ]);
    parseSelectArgs(ast, stream);
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'fieldA').setAlias('aliasA'),
    ]);
    expect(stream.get().value).toBe('FROM');
  });

  it('should parse a single field with case-insensitive alias: SELECT fieldA as aliasA', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.word, 'as'),
      new Token(Type.word, 'aliasA'),
      new Token(Type.word, 'FROM'),
    ]);
    parseSelectArgs(ast, stream);
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'fieldA').setAlias('aliasA'),
    ]);
    expect(stream.get().value).toBe('FROM');
  });

  it('should parse multiple fields: SELECT fieldA, fieldB', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.comma, ','),
      new Token(Type.word, 'fieldB'),
      new Token(Type.word, 'FROM'),
    ]);
    parseSelectArgs(ast, stream);
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'fieldA'),
      new FieldProperty(null, 'fieldB'),
    ]);
    expect(stream.get().value).toBe('FROM');
  });

  it('should parse multiple fields with aliases: SELECT fieldA AS aliasA, fieldB as aliasB', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.word, 'AS'),
      new Token(Type.word, 'aliasA'),
      new Token(Type.comma, ','),
      new Token(Type.word, 'fieldB'),
      new Token(Type.word, 'as'),
      new Token(Type.word, 'aliasB'),
      new Token(Type.word, 'FROM'),
    ]);
    parseSelectArgs(ast, stream);
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'fieldA').setAlias('aliasA'),
      new FieldProperty(null, 'fieldB').setAlias('aliasB'),
    ]);
    expect(stream.get().value).toBe('FROM');
  });

  it('should parse mixed fields (with and without alias): SELECT fieldA, fieldB AS aliasB, fieldC', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.comma, ','),
      new Token(Type.word, 'fieldB'),
      new Token(Type.word, 'AS'),
      new Token(Type.word, 'aliasB'),
      new Token(Type.comma, ','),
      new Token(Type.word, 'fieldC'),
      new Token(Type.word, 'FROM'),
    ]);
    parseSelectArgs(ast, stream);
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'fieldA'),
      new FieldProperty(null, 'fieldB').setAlias('aliasB'),
      new FieldProperty(null, 'fieldC'),
    ]);
    expect(stream.get().value).toBe('FROM');
  });

  it('should throw if SELECT is followed immediately by end of stream', () => {
    stream = new TokenStream([new Token(Type.word, 'SELECT')]);
    // popNextIf('*') fails, then assertNext(Type.word) fails.
    expect(() => parseSelectArgs(ast, stream)).toThrow();
  });

  it('should throw with trailing comma: SELECT fieldA,', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.comma, ','),
      new Token(Type.word, 'FROM'), // FROM is here to avoid end-of-stream error
    ]);
    // After comma, assertNext(Type.word) will fail because next is FROM.
    expect(() => parseSelectArgs(ast, stream)).toThrow();
  });

  it('should throw with alias keyword but no alias name: SELECT fieldA AS', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.word, 'AS'),
      new Token(Type.word, 'FROM'), // FROM is here to avoid end-of-stream error
    ]);
    // After AS, assertNext(Type.word) will fail.
    expect(() => parseSelectArgs(ast, stream)).toThrow();
  });

  it('should throw with leading comma: SELECT ,fieldA', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.comma, ','),
      new Token(Type.word, 'fieldA'),
    ]);
    // assertNext(Type.word) for field name will fail as it finds a comma.
    expect(() => parseSelectArgs(ast, stream)).toThrow();
  });

  it('should consume the next token (e.g. FROM) if no comma after last field due to final stream.advance()', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT'),
      new Token(Type.word, 'fieldA'),
      new Token(Type.word, 'fieldB'), // No comma, followed by fieldB (which is like FROM)
      new Token(Type.word, 'fieldC'),
    ]);
    parseSelectArgs(ast, stream);
    expect(ast.fields).toEqual([
      new FieldProperty(null, 'fieldA'),
    ]);
    // The loop for 'fieldA' finishes. popNextIf(',') fails.
    // Then stream.advance() is called, consuming 'fieldB'.
    expect(stream.get().value).toBe('fieldB');
  });

});
