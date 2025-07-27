import { FieldProperty, ResolvedProperty } from "../../src/entities/property";
import { LengthFunction } from "../../src/sqlFunctions/length.function";
import { MeshedRow } from "../../src/types";

describe("LENGTH function", () => {
    const testRow: MeshedRow = {
        main: {
            text: "Hello World",
            number: 42
        }
    };

    it("should return string length for literal", () => {
        const fn = new LengthFunction("LENGTH", [new ResolvedProperty("test")]);
        expect(fn.resolve(testRow)).toBe(4);
    });

    it("should return string length for field value", () => {
        const fn = new LengthFunction("LENGTH", [new FieldProperty("main", "text")]);
        expect(fn.resolve(testRow)).toBe(11); // "Hello World"
    });

    it("should handle empty string", () => {
        const fn = new LengthFunction("LENGTH", [new ResolvedProperty("")]);
        expect(fn.resolve(testRow)).toBe(0);
    });

    it("should throw if argument is not a string", () => {
        const fn = new LengthFunction("LENGTH", [new FieldProperty("main", "number")]);
        expect(() => fn.resolve(testRow)).toThrow("Length function requires 1st argument to be of type string");
    });

    it("should throw if no arguments provided", () => {
        const fn = new LengthFunction("LENGTH");
        expect(() => fn.resolve(testRow)).toThrow("Length function requires 1st argument to be of type string");
    });

    it("should throw if multiple arguments provided", () => {
        const fn = new LengthFunction("LENGTH", [new ResolvedProperty("test1"), new ResolvedProperty("test2")]);
        expect(() => fn.resolve(testRow)).toThrow("Length function requires less than or equal to 1 arguments");
    });
});
