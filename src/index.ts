import { lex } from "./lexer";
import { tokenize } from "./parser";

// const tt = tokenize("SELECT my.fucking.deep.data.object FROM straight.json >> SELECT name From gay.json JOIN $0");
const sql = `SELECT log.entries FROM ./data/sprint1.har >> SELECT _webSocketMessages from $0 >> SELECT * FROM $0 WHERE type=receive`;
const sql = `SELECT entries[]._webSocketMessages FROM ./data/sprint1.har WHERE entries[]._webSocketMessages.type=receive`;
const tokens = tokenize(sql);
const ast = lex(tokens);
console.log(tokens, ast);
ast.execute().then(console.log);
