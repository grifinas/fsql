import { FieldProperty, ResolvedProperty } from "../../src/entities/property";
import { UpperFunction } from "../../src/sqlFunctions/upper.function";
import { MeshedRow } from "../../src/types";

describe("UPPER function", () => {
    const testRow: MeshedRow = {
        main: {
            text: "Hello World",
            mixedCase: "MiXeD cAsE",
            number: 42
        }
    };

    it("should convert string to uppercase", () => {
        const fn = new UpperFunction("UPPER", [new ResolvedProperty("test")]);
        expect(fn.resolve(testRow)).toBe("TEST");
    });

    it("should convert field value to uppercase", () => {
        const fn = new UpperFunction("UPPER", [new FieldProperty("main", "text")]);
        expect(fn.resolve(testRow)).toBe("HELLO WORLD");
    });

    it("should handle mixed case text", () => {
        const fn = new UpperFunction("UPPER", [new FieldProperty("main", "mixedCase")]);
        expect(fn.resolve(testRow)).toBe("MIXED CASE");
    });

    it("should throw if argument is not a string", () => {
        const fn = new UpperFunction("UPPER", [new FieldProperty("main", "number")]);
        expect(() => fn.resolve(testRow)).toThrow("Upper function requires 1st argument to be of type string");
    });

    it("should throw if no arguments provided", () => {
        const fn = new UpperFunction("UPPER");
        expect(() => fn.resolve(testRow)).toThrow("Upper function requires 1st argument to be of type string");
    });

    it("should throw if multiple arguments provided", () => {
        const fn = new UpperFunction("UPPER", [new ResolvedProperty("test1"), new ResolvedProperty("test2")]);
        expect(() => fn.resolve(testRow)).toThrow("Upper function requires less than or equal to 1 arguments");
    });
});
