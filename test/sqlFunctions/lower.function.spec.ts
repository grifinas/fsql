import { FieldProperty, ResolvedProperty } from "../../src/entities/property";
import { LowerFunction } from "../../src/sqlFunctions/lower.function";
import { MeshedRow } from "../../src/types";

describe("LOWER function", () => {
    const testRow: MeshedRow = {
        main: {
            text: "Hello World",
            mixedCase: "MiXeD cAsE",
            number: 42
        }
    };

    it("should convert string to lowercase", () => {
        const fn = new LowerFunction("LOWER", [new ResolvedProperty("TEST")]);
        expect(fn.resolve(testRow)).toBe("test");
    });

    it("should convert field value to lowercase", () => {
        const fn = new LowerFunction("LOWER", [new FieldProperty("main", "text")]);
        expect(fn.resolve(testRow)).toBe("hello world");
    });

    it("should handle mixed case text", () => {
        const fn = new LowerFunction("LOWER", [new FieldProperty("main", "mixedCase")]);
        expect(fn.resolve(testRow)).toBe("mixed case");
    });

    it("should throw if argument is not a string", () => {
        const fn = new LowerFunction("LOWER", [new FieldProperty("main", "number")]);
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires 1st argument to be of type string");
    });

    it("should throw if no arguments provided", () => {
        const fn = new LowerFunction("LOWER");
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires 1st argument to be of type string");
    });

    it("should throw if multiple arguments provided", () => {
        const fn = new LowerFunction("LOWER", [new ResolvedProperty("test1"), new ResolvedProperty("test2")]);
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires less than or equal to 1 arguments");
    });
});
