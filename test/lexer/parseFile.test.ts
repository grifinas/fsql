import { parseFile } from '../../src/lexer/parseFile';
import { TokenStream } from '../../src/tokenStream';
import { Token, Type } from '../../src/token';
import { FileDataSource, VariableDataSource } from '../../src/dataSource';

describe('parseFile - Integration Tests', () => {
  let stream: TokenStream;

  it('should parse a variable like @myVar', () => {
    stream = new TokenStream([
      new Token(Type.special, '@'),
      new Token(Type.word, 'myVar'),
      new Token(Type.semicolon, ';'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(VariableDataSource);
    expect(result.ref()).toBe('@myVar');
    expect(stream.get().value).toBe(';'); // Stream should be at the semicolon
  });

  it('should parse a variable like @myVar even without semicolon', () => {
    stream = new TokenStream([
      new Token(Type.special, '@'),
      new Token(Type.word, 'myVar'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(VariableDataSource);
    expect(result.ref()).toBe('@myVar');
    expect(stream.done()).toBe(true);
  });

  it('should parse a simple file path like data.json even without semicolon', () => {
    stream = new TokenStream([
      new Token(Type.word, 'data'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'json'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('data.json');
    expect(stream.done()).toBe(true);
  });

  it('should parse a simple file path like data.json', () => {
    stream = new TokenStream([
      new Token(Type.word, 'data'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'json'),
      new Token(Type.semicolon, ';'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('data.json');
    expect(stream.get().value).toBe(';'); // Should stop before semicolon and regress
  });

  it('should parse a file path with folders like folder/file.txt', () => {
    stream = new TokenStream([
      new Token(Type.word, 'folder'),
      new Token(Type.special, '/'),
      new Token(Type.word, 'file'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'txt'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('folder/file.txt');
    expect(stream.done()).toBe(true);
  });

  it('should parse a file path with numbers like data123.config.js', () => {
    stream = new TokenStream([
      new Token(Type.word, 'data'),
      new Token(Type.number, '123'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'config'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'js'),
      new Token(Type.word, 'WHERE'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('data123.config.js');
    expect(stream.get().value).toBe('WHERE');
  });

  it('should parse a file path with alias keyword (AS)', () => {
    stream = new TokenStream([
      new Token(Type.word, 'myFile'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'csv'),
      new Token(Type.word, 'AS'),
      new Token(Type.special, '@'),
      new Token(Type.word, 'm'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect((result as FileDataSource).filePath).toBe('myFile.csv');
    expect(result.ref()).toBe('@m');
    expect(stream.done()).toBe(true);
  });

  it('should throw unexpected token for path like file@name.json (current buggy behavior)', () => {
    stream = new TokenStream([
      new Token(Type.word, 'file'),
      new Token(Type.special, '@'),
      new Token(Type.word, 'name'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'json'),
    ]);
    // parseFile reads '@', then calls parseVariable. parseVariable expects current token to be '@',
    // but it's 'name'. So parseVariable returns null. parseFile then throws unexpectedToken.
    expect(() => parseFile(stream)).toThrowError(); // Specific error can be 'Unexpected token: @ of type special...'
                                                    // or similar depending on exact TokenStream error message for unexpectedToken.
  });

  it('should throw for unexpected token in path like path/!/file.json', () => {
    stream = new TokenStream([
      new Token(Type.word, 'path'),
      new Token(Type.special, '/'),
      new Token(Type.special, '!',), // Unexpected token
      new Token(Type.special, '/'),
      new Token(Type.word, 'file'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'json'),
    ]);
    expect(() => parseFile(stream)).toThrowError(); // Error for '!'
  });

   it('should parse path ending with number like folder/file123', () => {
    stream = new TokenStream([
      new Token(Type.word, 'folder'),
      new Token(Type.special, '/'),
      new Token(Type.word, 'file'),
      new Token(Type.number, '123'),
      new Token(Type.semicolon, ';'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('folder/file123');
    expect(stream.get().value).toBe(';');
  });

  it('should parse path starting with numbers like 12345', () => {
    stream = new TokenStream([
      new Token(Type.number, '12345'),
      new Token(Type.word, 'AS'),
    ]);
    const result = parseFile(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('12345AS');
    expect(stream.done()).toBe(true);
  });
});
