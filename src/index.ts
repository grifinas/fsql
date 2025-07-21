import { lex } from "./lexer/lexer";
import { tokenize } from "./tokenizer";
import { TokenStream } from "./tokenStream";

export async function main(sql: string) {
    const tokens: TokenStream = tokenize(sql);
    const ast = lex(tokens);
    return JSON.stringify(await ast.execute(), null, 2);
}