import "./sqlFunctions";
import { lex } from "@lexer";
import { TokenStream, tokenize } from "@tokenizer";

export async function main(
  sql: string,
  variables: Record<string, object[]> = {},
): Promise<object[]> {
  const tokens: TokenStream = tokenize(sql);
  const ast = lex(tokens);
  for (const [key, value] of Object.entries(variables)) {
    ast.assignVariable(key, value);
  }
  return await ast.execute();
}
