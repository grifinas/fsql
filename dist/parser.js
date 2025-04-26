"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = tokenize;
exports.tokenAssert = tokenAssert;
exports.unexpectedToken = unexpectedToken;
const token_1 = require("./token");
const tokenStream_1 = require("./tokenStream");
const cliAssert_1 = require("./cliAssert");
function isWord(char) {
    return /[a-zA-Z\-]/.test(char);
}
function isNumber(char) {
    return /[0-9]/.test(char);
}
function tokenize(input) {
    const tokens = [];
    let current = 0;
    while (current < input.length) {
        const position = current;
        let char = input[current];
        if (isWord(char)) {
            let value = "";
            while (current < input.length && isWord(input[current])) {
                value += input[current];
                current++;
            }
            tokens.push(new token_1.Token(token_1.Type.word, value, position));
            continue;
        }
        if (isNumber(char)) {
            let value = "";
            while (current < input.length && isNumber(input[current])) {
                value += input[current];
                current++;
            }
            tokens.push(new token_1.Token(token_1.Type.number, value, position));
            continue;
        }
        if (char === "[" || char === "]") {
            tokens.push(new token_1.Token(token_1.Type.bracket, char, position));
            current++;
            continue;
        }
        if (char === "{" || char === "}") {
            tokens.push(new token_1.Token(token_1.Type.brace, char, position));
            current++;
            continue;
        }
        if (char === "(" || char === ")") {
            tokens.push(new token_1.Token(token_1.Type.paren, char, position));
            current++;
            continue;
        }
        if (char === ".") {
            tokens.push(new token_1.Token(token_1.Type.dot, char, position));
            current++;
            continue;
        }
        if (char === ";") {
            tokens.push(new token_1.Token(token_1.Type.semicolon, char, position));
            current++;
            continue;
        }
        if (char === ",") {
            tokens.push(new token_1.Token(token_1.Type.comma, char, position));
            current++;
            continue;
        }
        if (char === "=") {
            tokens.push(new token_1.Token(token_1.Type.equals, char, position));
            current++;
            continue;
        }
        if (char === ">" || char === "<") {
            tokens.push(new token_1.Token(token_1.Type.comp, char, position));
            current++;
            continue;
        }
        if (["@", "$", "%", "^", "&", "*", "/"].includes(char)) {
            tokens.push(new token_1.Token(token_1.Type.special, char, position));
            current++;
            continue;
        }
        //Comment
        if (char === "#") {
            let comment = "";
            while (current < input.length && input[current] !== "\n") {
                comment += input[current];
                current++;
            }
            continue;
        }
        // Skip any whitespace
        if (/\s/.test(char)) {
            current++;
            continue;
        }
        console.log("Unexpected char near:", input.substring(current - 10, current + 10));
        throw new TypeError("Unexpected character: " + char);
    }
    return new tokenStream_1.TokenStream(tokens);
}
function tokenAssert(token, type, value) {
    const typesEqual = token.type === type;
    const valuesEqual = value ? token.value === value : true;
    (0, cliAssert_1.cliAssert)(typesEqual && valuesEqual, `Expected token to be ${type}${value ? `::${value}` : ""}, but got: ${JSON.stringify(token, null, 2)} at ${new Error().stack}`);
}
function unexpectedToken(token, where, expected) {
    (0, cliAssert_1.cliAssert)(false, `Unexpected token ${where ? `in ${where}` : ""}: ${JSON.stringify(token, null, 2)}${expected ? ` Expected: ${expected}` : ""}`);
}
//# sourceMappingURL=parser.js.map