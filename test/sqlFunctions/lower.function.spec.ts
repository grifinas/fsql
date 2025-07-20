import { FieldProperty, ResolvedProperty } from "../../src/property";
import { MeshedRow } from "../../src/meshData";
import { LowerFunction } from "../../src/sqlFunctions/lower.function";

describe.skip("LOWER function", () => {
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
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires a string argument");
    });

    it("should throw if no arguments provided", () => {
        const fn = new LowerFunction("LOWER");
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires exactly one argument");
    });

    it("should throw if multiple arguments provided", () => {
        const fn = new LowerFunction("LOWER", [new ResolvedProperty("test1"), new ResolvedProperty("test2")]);
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires exactly one argument");
    });
});
