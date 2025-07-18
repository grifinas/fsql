import { FieldProperty, ResolvedProperty } from "../../src/filterFunction";
import { MeshedRow } from "../../src/meshData";
import { LengthFunction } from "../../src/sqlFunctions/length.function";

describe("LENGTH function", () => {
    const testRow: MeshedRow = {
        main: {
            text: "Hello World",
            number: 42
        }
    };

    it("should return string length for literal", () => {
        const fn = new LengthFunction("LENGTH", { value: "test" } as ResolvedProperty);
        expect(fn.resolve(testRow)).toBe(4);
    });

    it("should return string length for field value", () => {
        const fn = new LengthFunction("LENGTH", { source: "main", field: "text" } as FieldProperty);
        expect(fn.resolve(testRow)).toBe(11); // "Hello World"
    });

    it("should handle empty string", () => {
        const fn = new LengthFunction("LENGTH", { value: "" } as ResolvedProperty);
        expect(fn.resolve(testRow)).toBe(0);
    });

    it("should throw if argument is not a string", () => {
        const fn = new LengthFunction("LENGTH", { source: "main", field: "number" } as FieldProperty);
        expect(() => fn.resolve(testRow)).toThrow("Length function requires a string argument");
    });

    it("should throw if no arguments provided", () => {
        const fn = new LengthFunction("LENGTH");
        expect(() => fn.resolve(testRow)).toThrow("Length function requires exactly one argument");
    });

    it("should throw if multiple arguments provided", () => {
        const fn = new LengthFunction("LENGTH",
            { value: "test1" } as ResolvedProperty,
            { value: "test2" } as ResolvedProperty
        );
        expect(() => fn.resolve(testRow)).toThrow("Length function requires exactly one argument");
    });
});
