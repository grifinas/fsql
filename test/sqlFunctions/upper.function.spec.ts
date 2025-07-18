import { FieldProperty, ResolvedProperty } from "../../src/filterFunction";
import { MeshedRow } from "../../src/meshData";
import { UpperFunction } from "../../src/sqlFunctions/upper.function";

describe("UPPER function", () => {
    const testRow: MeshedRow = {
        main: {
            text: "Hello World",
            mixedCase: "MiXeD cAsE",
            number: 42
        }
    };

    it("should convert string to uppercase", () => {
        const fn = new UpperFunction("UPPER", { value: "test" } as ResolvedProperty);
        expect(fn.resolve(testRow)).toBe("TEST");
    });

    it("should convert field value to uppercase", () => {
        const fn = new UpperFunction("UPPER", { source: "main", field: "text" } as FieldProperty);
        expect(fn.resolve(testRow)).toBe("HELLO WORLD");
    });

    it("should handle mixed case text", () => {
        const fn = new UpperFunction("UPPER", { source: "main", field: "mixedCase" } as FieldProperty);
        expect(fn.resolve(testRow)).toBe("MIXED CASE");
    });

    it("should throw if argument is not a string", () => {
        const fn = new UpperFunction("UPPER", { source: "main", field: "number" } as FieldProperty);
        expect(() => fn.resolve(testRow)).toThrow("Upper function requires a string argument");
    });

    it("should throw if no arguments provided", () => {
        const fn = new UpperFunction("UPPER");
        expect(() => fn.resolve(testRow)).toThrow("Upper function requires exactly one argument");
    });

    it("should throw if multiple arguments provided", () => {
        const fn = new UpperFunction("UPPER", 
            { value: "test1" } as ResolvedProperty,
            { value: "test2" } as ResolvedProperty
        );
        expect(() => fn.resolve(testRow)).toThrow("Upper function requires exactly one argument");
    });
});
