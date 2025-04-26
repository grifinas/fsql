"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AST = void 0;
const fs = __importStar(require("fs/promises"));
class AST {
    constructor() {
        this.all = false;
        this.columns = [];
        this.mainfile = "";
        this.joinFiles = {};
        this.where = () => true;
        this.order = undefined;
    }
    async execute() {
        const content = await fs.readFile(this.mainfile);
        const unknown = JSON.parse(content.toString());
        const data = Array.isArray(unknown) ? unknown : [unknown];
        for (const [filePath, whereFn] of Object.entries(this.joinFiles)) {
            const joinContent = await fs.readFile(filePath);
            const joinUnknown = JSON.parse(joinContent.toString());
            const joinData = Array.isArray(joinUnknown)
                ? joinUnknown
                : [joinUnknown];
            const filteredJoin = joinData.filter(whereFn);
            const oldData = data.splice(0, data.length);
            for (const joinRow of filteredJoin) {
                for (const row of oldData) {
                    data.push({ ...row, ...joinRow });
                }
            }
        }
        const mapped = this.all
            ? data
            : data.map((row) => {
                const m = {};
                for (const column of this.columns) {
                    if (column in row) {
                        m[column] = row[column];
                    }
                    else {
                        throw new Error(`Unknown column: ${column}`);
                    }
                }
                return m;
            });
        const filtered = mapped.filter(this.where);
        if (this.order) {
            const [key, value] = this.order;
            return filtered.sort((a, b) => {
                if (!(key in a) || !(key in b))
                    throw new Error(`No ${key} in some rows`);
                const v1 = a[key];
                const v2 = b[key];
                if (typeof v1 === "string") {
                    return value * v1.localeCompare(v2);
                }
                else if (typeof v1 === "number") {
                    return value * (v1 - v2);
                }
                else {
                    throw new Error(`Can not compare values of type: ${typeof v1}`);
                }
            });
        }
        return filtered;
    }
    addAnd(fn) {
        const before = this.where;
        this.where = (row) => {
            const already = before(row);
            if (!already)
                return false;
            return fn(row);
        };
    }
}
exports.AST = AST;
//# sourceMappingURL=ast.js.map