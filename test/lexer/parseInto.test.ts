import { parseInto } from '../../src/lexer/parseInto';
import { AST } from '../../src/ast';
import { TokenStream } from '../../src/tokenStream';
import { Token, Type } from '../../src/token';

describe('parseInto - Integration Tests', () => {
  let ast: AST;
  let stream: TokenStream;

  beforeEach(() => {
    ast = new AST();
  });

  it('should parse "INTO @varName" and set ast.intoName', () => {
    stream = new TokenStream([
      new Token(Type.word, 'INTO', 0),
      new Token(Type.special, '@', 1),
      new Token(Type.word, 'varName', 2),
      new Token(Type.semicolon, ';', 3),
    ]);
    parseInto(ast, stream);
    expect(ast.intoName).toBe('@varName');
    expect(stream.get().type).toBe(Type.semicolon); // Stream should be at the token after 'varName'
  });

  it('should parse "into @anotherVar" (case-insensitive INTO)', () => {
    stream = new TokenStream([
      new Token(Type.word, 'into', 0),
      new Token(Type.special, '@', 1),
      new Token(Type.word, 'anotherVar', 2),
    ]);
    parseInto(ast, stream);
    expect(ast.intoName).toBe('@anotherVar');
    expect(stream.hasNext()).toBe(false); // Stream should be at the end
  });

  it('should not set ast.intoName if "INTO" keyword is not present', () => {
    stream = new TokenStream([
      new Token(Type.word, 'SELECT', 0),
      new Token(Type.special, '*', 1),
    ]);
    parseInto(ast, stream);
    expect(ast.intoName).toBeUndefined();
    // popNextIf for 'INTO' will not advance if 'INTO' is not found.
    expect(stream.getIndex()).toBeLessThan(1);
    expect(stream.get().type).toBe(Type.word);
    expect(stream.get().value).toBe('SELECT');
  });

  it('should throw if "INTO" is present but variable name is missing "@" (e.g., "INTO varName")', () => {
    stream = new TokenStream([
      new Token(Type.word, 'INTO', 0),
      new Token(Type.word, 'varName', 1), // Missing @
    ]);
    // parseVariable will return null, parseInto will call stream.unexpectedToken()
    expect(() => parseInto(ast, stream)).toThrow();
  });

  it('should throw if "INTO" is present but variable name is just "@" (e.g., "INTO @;")', () => {
    stream = new TokenStream([
      new Token(Type.word, 'INTO', 0),
      new Token(Type.special, '@', 1),
      new Token(Type.semicolon, ';', 2), // Missing word after @
    ]);
    // parseVariable will consume '@', then assertNext(Type.word) will fail.
    expect(() => parseInto(ast, stream)).toThrow();
  });

  it('should throw if "INTO @" is at the end of the stream', () => {
    stream = new TokenStream([
      new Token(Type.word, 'INTO', 0),
      new Token(Type.special, '@', 1),
    ]);
    // parseVariable will consume '@', then assertNext(Type.word) will fail due to end of stream.
    expect(() => parseInto(ast, stream)).toThrow();
  });

  it('should throw if "INTO" is at the end of the stream', () => {
    stream = new TokenStream([
      new Token(Type.word, 'INTO', 0),
    ]);
    // parseVariable will be called. It expects '@' but stream ends. It returns null.
    // parseInto then calls stream.unexpectedToken() because varName is null and stream has no next token.
    expect(() => parseInto(ast, stream)).toThrow();
  });

});
