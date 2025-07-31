import { parseDataSource } from '@src/lexer/parseDataSource';
import { TokenStream } from '@src/tokenizer/tokenStream';
import { Token } from '@src/tokenizer/token';
import { Type } from '@src/types';
import { FileDataSource, VariableDataSource } from '@src/entities/dataSource';

describe('parseDataSource - Integration Tests', () => {
  let stream: TokenStream;

  it('should parse a variable like @myVar', () => {
    stream = new TokenStream([
      new Token(Type.special, '@'),
      new Token(Type.word, 'myVar'),
      new Token(Type.semicolon, ';'),
    ]);
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(VariableDataSource);
    expect(result.ref()).toBe('@myVar');
    expect(stream.get().value).toBe(';'); // Stream should be at the semicolon
  });

  it('should parse a variable like @myVar even without semicolon', () => {
    stream = new TokenStream([
      new Token(Type.special, '@'),
      new Token(Type.word, 'myVar'),
    ]);
    const result = parseDataSource(stream);
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
    const result = parseDataSource(stream);
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
    const result = parseDataSource(stream);
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
    const result = parseDataSource(stream);
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
    const result = parseDataSource(stream);
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
    const result = parseDataSource(stream);
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
    expect(() => parseDataSource(stream)).toThrowError(); // Specific error can be 'Unexpected token: @ of type special...'
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
    expect(() => parseDataSource(stream)).toThrowError(); // Error for '!'
  });

   it('should parse path ending with number like folder/file123', () => {
    stream = new TokenStream([
      new Token(Type.word, 'folder'),
      new Token(Type.special, '/'),
      new Token(Type.word, 'file'),
      new Token(Type.number, '123'),
      new Token(Type.semicolon, ';'),
    ]);
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('folder/file123');
    expect(stream.get().value).toBe(';');
  });

  it('should parse path starting with numbers like 12345', () => {
    stream = new TokenStream([
      new Token(Type.number, '12345'),
      new Token(Type.word, 'AS'),
    ]);
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('12345AS');
    expect(stream.done()).toBe(true);
  });

  it('should parse a tmpfile like /var/folders/r6/60svyt3d4z50k0csszbzzppw0000gr/T/sql.GbpWX1t', async () => {
    stream = new TokenStream([
      new Token(Type.special, '/'),
      new Token(Type.word, 'var'),
      new Token(Type.special, '/'),
      new Token(Type.word, 'folders'),
      new Token(Type.special, '/'),
      new Token(Type.word, 'r6'),
      new Token(Type.special, '/'),
      new Token(Type.number, '60'),
      new Token(Type.word, 'svyt'),
      new Token(Type.number, '3'),
      new Token(Type.word, 'd'),
      new Token(Type.number, '4'),
      new Token(Type.word, 'z'),
      new Token(Type.number, '50'),
      new Token(Type.word, 'k'),
      new Token(Type.number, '0'),
      new Token(Type.word, 'csszbzzppw'),
      new Token(Type.number, '0000'),
      new Token(Type.word, 'gr'),
      new Token(Type.special, '/'),
      new Token(Type.word, 'T'),
      new Token(Type.special, '/'),
      new Token(Type.word, 'sql'),
      new Token(Type.dot, '.'),
      new Token(Type.word, 'GbpWX'),
      new Token(Type.number, '1'),
      new Token(Type.word, 't'),
    ]);
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('/var/folders/r6/60svyt3d4z50k0csszbzzppw0000gr/T/sql.GbpWX1t');
    expect(stream.done()).toBe(true);
  });
});
