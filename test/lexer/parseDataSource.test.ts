import { parseDataSource } from '@src/lexer/parseDataSource';
import { TokenStream } from '@src/tokenizer/tokenStream';
import { FileDataSource, VariableDataSource } from '@src/entities/dataSource';
import { tokenize } from '@tokenizer';

describe('parseDataSource - Integration Tests', () => {
  let stream: TokenStream;

  it('should parse a variable like @myVar', () => {
    stream = tokenize('@myVar;');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(VariableDataSource);
    expect(result.ref()).toBe('@myVar');
    expect(stream.get().value).toBe(';'); // Stream should be at the semicolon
  });

  it('should parse a variable like @myVar even without semicolon', () => {
    stream = tokenize('@myVar');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(VariableDataSource);
    expect(result.ref()).toBe('@myVar');
    expect(stream.done()).toBe(true);
  });

  it('should parse a simple file path like data.json even without semicolon', () => {
    stream = tokenize('data.json');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('data.json');
    expect(stream.done()).toBe(true);
  });

  it('should parse a simple file path like data.json', () => {
    stream = tokenize('data.json;');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('data.json');
    expect(stream.get().value).toBe(';'); // Should stop before semicolon and regress
  });

  it('should parse a file path with folders like folder/file.txt', () => {
    stream = tokenize('folder/file.txt');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('folder/file.txt');
    expect(stream.done()).toBe(true);
  });

  it('should parse a file path with numbers like data123.config.js', () => {
    stream = tokenize('data123.config.js WHERE');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('data123.config.js');
    expect(stream.get().value).toBe('WHERE');
  });

  it('should parse a file path with alias keyword (AS)', () => {
    stream = tokenize('myFile.csv AS @m');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect((result as FileDataSource).filePath).toBe('myFile.csv');
    expect(result.ref()).toBe('@m');
    expect(stream.done()).toBe(true);
  });

  it('should throw unexpected token for path like file@name.json (current buggy behavior)', () => {
    stream = tokenize('file@name.json');
    // parseFile reads '@', then calls parseVariable. parseVariable expects current token to be '@',
    // but it's 'name'. So parseVariable returns null. parseFile then throws unexpectedToken.
    expect(() => parseDataSource(stream)).toThrowError(); // Specific error can be 'Unexpected token: @ of type special...'
                                                    // or similar depending on exact TokenStream error message for unexpectedToken.
  });

  it('should throw for unexpected token in path like path/!/file.json', () => {
    stream = tokenize('path/!/file.json');
    expect(() => parseDataSource(stream)).toThrowError(); // Error for '!'
  });

   it('should parse path ending with number like folder/file123', () => {
    stream = tokenize('folder/file123;');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('folder/file123');
    expect(stream.get().value).toBe(';');
  });

  it('should parse path starting with numbers like 12345', () => {
    stream = tokenize('12345 AS @n');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('@n');
    expect((result as FileDataSource).filePath).toBe('12345');
    expect(stream.done()).toBe(true);
  });

  it('should parse a tmpfile like /var/folders/r6/60svyt3d4z50k0csszbzzppw0000gr/T/sql.GbpWX1t', async () => {
    stream = tokenize('/var/folders/r6/60svyt3d4z50k0csszbzzppw0000gr/T/sql.GbpWX1t');
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('/var/folders/r6/60svyt3d4z50k0csszbzzppw0000gr/T/sql.GbpWX1t');
    expect(stream.done()).toBe(true);
  });

  it('should parse a tmpfile ending with number like /var/folders/r6/60svyt3d4z50k0csszbzzppw0000gr/T/sql.GbpWXt1', async () => {
    stream = tokenize('/var/folders/r6/60svyt3d4z50k0csszbzzppw0000gr/T/sql.GbpWXt1 INTO')
    const result = parseDataSource(stream);
    expect(result).toBeInstanceOf(FileDataSource);
    expect(result.ref()).toBe('/var/folders/r6/60svyt3d4z50k0csszbzzppw0000gr/T/sql.GbpWXt1');
    //Should end on the last token
    expect(stream.get().value).toBe('INTO');
  });
});
