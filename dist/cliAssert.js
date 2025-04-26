"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliAssert = cliAssert;
function cliAssert(value, message) {
    if (value)
        return;
    if (message) {
        if (typeof message === "string") {
            console.error(message);
        }
        else {
            console.error(message());
        }
    }
    throw new Error();
}
//# sourceMappingURL=cliAssert.js.map