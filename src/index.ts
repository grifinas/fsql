import "./sqlFunctions";
import { lex } from "@lexer";
import { TokenStream, tokenize } from "@tokenizer";
import { pluginRegistry } from "./plugins/registry";

let pluginsInitialized: Promise<void> | null = null;

async function ensurePluginsInitialized(): Promise<void> {
  if (!pluginsInitialized) {
    pluginsInitialized = pluginRegistry.loadExternalPlugins();
  }
  await pluginsInitialized;
}

export async function main(
  sql: string,
  variables: Record<string, object[]> = {},
): Promise<object[]> {
  await ensurePluginsInitialized();
  
  const tokens: TokenStream = tokenize(sql);
  const ast = lex(tokens);
  for (const [key, value] of Object.entries(variables)) {
    ast.assignVariable(key, value);
  }
  return await ast.execute();
}
export { pluginRegistry };