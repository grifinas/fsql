"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
// const tt = tokenize("SELECT my.fucking.deep.data.object FROM straight.json >> SELECT name From gay.json JOIN $0");
const tokens = (0, parser_1.tokenize)("SELECT log.entries FROM ./data/sprint1.har");
const ast = (0, lexer_1.lex)(tokens);
console.log(tokens, ast);
ast.execute().then(console.log);
//# sourceMappingURL=index.js.map