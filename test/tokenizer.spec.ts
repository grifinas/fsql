import { tokenize } from '../src/tokenizer';
import { Type } from "../src/token";

describe("tokenizer", () => {
  it("should parse select 1", () => {
    const stream = tokenize('SELECT 1');
    expect(stream.length).toBe(2);
  });

  it("should parse any sentance what so ever", () => {
    const stream = tokenize('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nunc nisl, tempus eu eros at, porttitor varius nisi.');
    expect(stream.length).toBeGreaterThan(0);
  });

  it("should ignore whitespaces", () => {
    const stream = tokenize('     Lorem      ipsum     ');
    expect(stream.length).toBe(2);
  });

  it("should parse numbers", () => {
    const stream = tokenize('1 21 357 654813258821');
    expect(stream.length).toBe(4);

    while(stream.hasNext()) {
      expect(stream.next().type).toBe(Type.number);
    }
  });

  it("should parse brackets, braces and parentheses", () => {
    const input = '{[()]()}[]';
    const stream = tokenize(input);
    expect(stream.length).toBe(input.length);
    expect(stream.next().type).toBe(Type.brace);
    expect(stream.next().type).toBe(Type.bracket);
    expect(stream.next().type).toBe(Type.paren);
    expect(stream.next().type).toBe(Type.paren);
    expect(stream.next().type).toBe(Type.bracket);
    expect(stream.next().type).toBe(Type.paren);
    expect(stream.next().type).toBe(Type.paren);
    expect(stream.next().type).toBe(Type.brace);
    expect(stream.next().type).toBe(Type.bracket);
    expect(stream.next().type).toBe(Type.bracket);
  });

  it("should parse dots, commas, colons and semicolons", () => {
    const input = ',.;';
    const stream = tokenize(input);
    expect(stream.length).toBe(input.length);
    expect(stream.next().type).toBe(Type.comma);
    expect(stream.next().type).toBe(Type.dot);
    expect(stream.next().type).toBe(Type.semicolon);
  });

  it("should parse less than, more than and equals", () => {
    const input = '<=>';
    const stream = tokenize(input);
    expect(stream.length).toBe(input.length);
    const lt = stream.next();
    expect(lt.type).toBe(Type.comp);
    expect(lt.value).toBe('<');
    expect(stream.next().type).toBe(Type.equals);
    const gt = stream.next();
    expect(gt.type).toBe(Type.comp);
    expect(gt.value).toBe('>');
  });

  it("should parse special characters", () => {
    const input = '@$%^&*/';
    const stream = tokenize(input);
    expect(stream.length).toBe(input.length);
    expect(stream.next().type).toBe(Type.special);
  });

  it("should throw on unexpected char", () => {
    const input = '😀😔😤';
    expect(() => tokenize(input)).toThrow();
  });

  it("should treat '#' as a comment symbol for one line", () => {
    const input = 'foo#😀😔😤\nbar';
    const stream = tokenize(input);
    expect(stream.length).toBe(2);
    expect(stream.next().type).toBe(Type.word);
    expect(stream.next().type).toBe(Type.word);
  });
})
