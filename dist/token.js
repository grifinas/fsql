"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.Token = void 0;
class Token {
    constructor(type, value, position) {
        this.type = type;
        this.value = value;
        this.position = position;
    }
    is(type, value, caseSensitive = true) {
        const typesEqual = this.type === type;
        let valuesEqual = true;
        if (value) {
            valuesEqual = caseSensitive ? this.value === value : this.value.toLocaleLowerCase() === value.toLocaleLowerCase();
        }
        return typesEqual && valuesEqual;
    }
}
exports.Token = Token;
var Type;
(function (Type) {
    Type["word"] = "word";
    Type["number"] = "number";
    Type["bracket"] = "bracket";
    Type["brace"] = "brace";
    Type["paren"] = "paren";
    Type["special"] = "special";
    Type["dot"] = "dot";
    Type["comma"] = "comma";
    Type["semicolon"] = "semicolon";
    Type["equals"] = "equals";
    Type["comp"] = "comp";
})(Type || (exports.Type = Type = {}));
//# sourceMappingURL=token.js.map