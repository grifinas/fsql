import { FieldProperty, ResolvedProperty } from "../../src/filterFunction";
import { MeshedRow } from "../../src/meshData";
import { LowerFunction } from "../../src/sqlFunctions/lower.function";

describe("LOWER function", () => {
    const testRow: MeshedRow = {
        main: {
            text: "Hello World",
            mixedCase: "MiXeD cAsE",
            number: 42
        }
    };

    it("should convert string to lowercase", () => {
        const fn = new LowerFunction("LOWER", { value: "TEST" } as ResolvedProperty);
        expect(fn.resolve(testRow)).toBe("test");
    });

    it("should convert field value to lowercase", () => {
        const fn = new LowerFunction("LOWER", { source: "main", field: "text" } as FieldProperty);
        expect(fn.resolve(testRow)).toBe("hello world");
    });

    it("should handle mixed case text", () => {
        const fn = new LowerFunction("LOWER", { source: "main", field: "mixedCase" } as FieldProperty);
        expect(fn.resolve(testRow)).toBe("mixed case");
    });

    it("should throw if argument is not a string", () => {
        const fn = new LowerFunction("LOWER", { source: "main", field: "number" } as FieldProperty);
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires a string argument");
    });

    it("should throw if no arguments provided", () => {
        const fn = new LowerFunction("LOWER");
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires exactly one argument");
    });

    it("should throw if multiple arguments provided", () => {
        const fn = new LowerFunction("LOWER", 
            { value: "test1" } as ResolvedProperty,
            { value: "test2" } as ResolvedProperty
        );
        expect(() => fn.resolve(testRow)).toThrow("Lower function requires exactly one argument");
    });
});
