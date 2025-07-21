import { parseFile } from '../../src/lexer/parseFile';
import { TokenStream } from '../../src/tokenStream';
import { Token, Type } from '../../src/token';
import { AliasedPropperty } from '../../src/ast';

describe('parseFile - Integration Tests', () => {
  let stream: TokenStream;

  it('should parse a variable like @myVar', () => {
    stream = new TokenStream([
      new Token(Type.special, '@', 0),
      new Token(Type.word, 'myVar', 1),
      new Token(Type.semicolon, ';', 2),
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: '@myVar', alias: '@myVar' });
    expect(stream.get().value).toBe(';'); // Stream should be at the semicolon
  });

  it('should parse a variable like @myVar even without semicolon', () => {
    stream = new TokenStream([
      new Token(Type.special, '@', 0),
      new Token(Type.word, 'myVar', 1),
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: '@myVar', alias: '@myVar' });
    expect(stream.done()).toBe(true);
  });

  it('should parse a simple file path like data.json even without semicolon', () => {
    stream = new TokenStream([
      new Token(Type.word, 'data', 0),
      new Token(Type.dot, '.', 1),
      new Token(Type.word, 'json', 2),
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: 'data.json', alias: null });
    expect(stream.done()).toBe(true);
  });

  it('should parse a simple file path like data.json', () => {
    stream = new TokenStream([
      new Token(Type.word, 'data', 0),
      new Token(Type.dot, '.', 1),
      new Token(Type.word, 'json', 2),
      new Token(Type.semicolon, ';', 3),
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: 'data.json', alias: null });
    expect(stream.get().value).toBe(';'); // Should stop before semicolon and regress
  });

  it('should parse a file path with folders like folder/file.txt', () => {
    stream = new TokenStream([
      new Token(Type.word, 'folder', 0),
      new Token(Type.special, '/', 1),
      new Token(Type.word, 'file', 2),
      new Token(Type.dot, '.', 3),
      new Token(Type.word, 'txt', 4),
      new Token(Type.word, 'AS', 5), // Stop before AS
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: 'folder/file.txt', alias: null });
    expect(stream.get().value).toBe('AS'); // Should stop before AS and regress
  });

  it('should parse a file path with numbers like data123.config.js', () => {
    stream = new TokenStream([
      new Token(Type.word, 'data', 0),
      new Token(Type.number, '123', 1),
      new Token(Type.dot, '.', 2),
      new Token(Type.word, 'config', 3),
      new Token(Type.dot, '.', 4),
      new Token(Type.word, 'js', 5),
      new Token(Type.word, 'WHERE', 6),
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: 'data123.config.js', alias: null });
    expect(stream.get().value).toBe('WHERE');
  });

  it('should stop parsing before an alias keyword (AS)', () => {
    stream = new TokenStream([
      new Token(Type.word, 'myFile', 0),
      new Token(Type.dot, '.', 1),
      new Token(Type.word, 'csv', 2),
      new Token(Type.word, 'AS', 3),
      new Token(Type.word, 'm', 4),
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: 'myFile.csv', alias: null });
    expect(stream.get().value).toBe('AS'); // parseFile regresses to AS
  });

  it('should throw unexpected token for path like file@name.json (current buggy behavior)', () => {
    stream = new TokenStream([
      new Token(Type.word, 'file', 0),
      new Token(Type.special, '@', 1),
      new Token(Type.word, 'name', 2),
      new Token(Type.dot, '.', 3),
      new Token(Type.word, 'json', 4),
    ]);
    // parseFile reads '@', then calls parseVariable. parseVariable expects current token to be '@',
    // but it's 'name'. So parseVariable returns null. parseFile then throws unexpectedToken.
    expect(() => parseFile(stream)).toThrowError(); // Specific error can be 'Unexpected token: @ of type special...'
                                                    // or similar depending on exact TokenStream error message for unexpectedToken.
  });

  it('should throw for unexpected token in path like path/!/file.json', () => {
    stream = new TokenStream([
      new Token(Type.word, 'path', 0),
      new Token(Type.special, '/', 1),
      new Token(Type.special, '!', 2), // Unexpected token
      new Token(Type.special, '/', 3),
      new Token(Type.word, 'file', 4),
      new Token(Type.dot, '.', 5),
      new Token(Type.word, 'json', 6),
    ]);
    expect(() => parseFile(stream)).toThrowError(); // Error for '!'
  });

   it('should parse path ending with number like folder/file123', () => {
    stream = new TokenStream([
      new Token(Type.word, 'folder', 0),
      new Token(Type.special, '/', 1),
      new Token(Type.word, 'file', 2),
      new Token(Type.number, '123', 3),
      new Token(Type.semicolon, ';', 4),
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: 'folder/file123', alias: null });
    expect(stream.get().value).toBe(';');
  });

  it('should parse path starting with numbers like 12345', () => {
    stream = new TokenStream([
      new Token(Type.number, '12345', 0),
      new Token(Type.word, 'AS', 1),
    ]);
    const result = parseFile(stream);
    expect(result).toEqual<AliasedPropperty>({ field: '12345AS', alias: null });
    expect(stream.done()).toBe(true);
  });
});
