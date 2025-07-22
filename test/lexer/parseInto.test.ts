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

  it('should parse "@varName" and set ast.intoName', () => {
    stream = new TokenStream([
      new Token(Type.special, '@'),
      new Token(Type.word, 'varName'),
      new Token(Type.semicolon, ';'),
    ]);
    parseInto(ast, stream);
    expect(ast.intoName).toBe('@varName');
    expect(stream.get().type).toBe(Type.semicolon); // Stream should be at the token after 'varName'
  });

  it('should throw if variable name is missing "@" (e.g., "varName")', () => {
    stream = new TokenStream([
      new Token(Type.word, 'varName'), // Missing @
    ]);
    // parseVariable will return null, parseInto will call stream.unexpectedToken()
    expect(() => parseInto(ast, stream)).toThrow();
  });

  it('should throw if variable name is just "@" (e.g., "@;")', () => {
    stream = new TokenStream([
      new Token(Type.special, '@'),
      new Token(Type.semicolon, ';'), // Missing word after @
    ]);
    // parseVariable will consume '@', then assertNext(Type.word) will fail.
    expect(() => parseInto(ast, stream)).toThrow();
  });

  it('should throw if stream is done with no variable', () => {
    stream = new TokenStream([]);
    expect(() => parseInto(ast, stream)).toThrow();
  });

});
