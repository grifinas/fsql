"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lex = lex;
const ast_1 = require("./ast");
const token_1 = require("./token");
function lex(stream) {
    const ast = new ast_1.AST();
    parseSelectArgs(ast, stream);
    parseFrom(ast, stream);
    optional(parseJoin, ast, stream);
    optional(parseWhere, ast, stream);
    optional(parseOrderBy, ast, stream);
    return ast;
}
function parseFrom(ast, stream) {
    stream.assert(token_1.Type.word, "from", false);
    ast.mainfile = parseFile(stream);
}
function parseSelectArgs(ast, stream) {
    stream.assert(token_1.Type.word, "select", false);
    if (stream.next().is(token_1.Type.special, "*")) {
        ast.all = true;
        stream.next();
    }
    else {
        ast.all = false;
        let token = stream.get();
        while (token) {
            stream.assert(token_1.Type.word);
            ast.columns.push(token.value);
            if (stream.next().is(token_1.Type.comma)) {
                token = stream.next();
                continue;
            }
            else {
                break;
            }
        }
    }
}
function parseFile(stream) {
    let path = "";
    let lastWasText = false;
    while (stream.hasNext()) {
        const fileToken = stream.next();
        if (fileToken.is(token_1.Type.dot) || fileToken.is(token_1.Type.special, '/')) {
            path += fileToken.value;
            lastWasText = false;
        }
        else if (fileToken.is(token_1.Type.word)) {
            if (lastWasText) {
                return path;
            }
            else {
                path += fileToken.value;
                lastWasText = true;
            }
        }
        else if (fileToken.is(token_1.Type.number)) {
            path += fileToken.value;
        }
        else {
            stream.unexpectedToken();
        }
    }
    return path;
}
function optional(fn, ast, stream) {
    if (!stream.hasNext()) {
        return;
    }
    fn(ast, stream);
}
function parseJoin(ast, stream) {
    if (!stream.peek().is(token_1.Type.word, "JOIN", false)) {
        return;
    }
    stream.next();
    const file = parseFile(stream);
    if (stream.next().is(token_1.Type.word, "ON", false)) {
        ast.joinFiles[file] = __whereFunction(stream);
    }
    else {
        ast.joinFiles[file] = () => true;
    }
    console.log("after join", stream.get());
}
function parseWhere(ast, stream) {
    if (!stream.peek().is(token_1.Type.word, "WHERE", false)) {
        return;
    }
    stream.next();
    ast.addAnd(__whereFunction(stream));
}
function parseOrderBy(ast, stream) {
    if (!stream.peek().is(token_1.Type.word, "ORDER", false)) {
        return;
    }
    stream.next();
    stream.next();
    stream.assert(token_1.Type.word, "BY", false);
    const parameter = stream.next();
    stream.assert(token_1.Type.word);
    if (stream.next().is(token_1.Type.word, "ASC", false)) {
        ast.order = [parameter.value, 1];
    }
    else if (stream.get().is(token_1.Type.word, "DESC", false)) {
        ast.order = [parameter.value, -1];
    }
    else {
        stream.unexpectedToken();
    }
}
function __whereFunction(stream) {
    const propertyToken = stream.next();
    stream.assert(token_1.Type.word);
    const property = propertyToken.value; //b
    const comparatorToken = stream.next(); // >
    if (comparatorToken.is(token_1.Type.comp) || comparatorToken.is(token_1.Type.equals)) {
        const valueToken = stream.next();
        const value = valueToken.is(token_1.Type.number)
            ? Number(valueToken.value)
            : valueToken.value;
        return (row) => {
            const key = row[property];
            //   console.log(property, `(${key})`, comparatorToken.value, value);
            switch (comparatorToken.value) {
                case ">":
                    return key > value;
                case "<":
                    return key < value;
                case "=":
                    return key === value;
                default:
                    throw new Error(`Unknown comparator: ${comparatorToken.value}`);
            }
        };
    }
    else {
        stream.unexpectedToken();
    }
}
//# sourceMappingURL=lexer.js.map