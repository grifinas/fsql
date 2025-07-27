import { FieldProperty, ResolvedProperty, FunctionProperty } from "../../src/entities/property";
import { SQLFunction, ValidatedArgs } from "../../src/sqlFunctions/sqlFunction";
import { SQLFactory } from "../../src/sqlFunctions/sqlFactory";
import { LengthFunction } from "../../src/sqlFunctions/length.function";
import { TrimFunction } from "../../src/sqlFunctions/trim.function";
import * as z from "zod";
import { MeshedRow } from "../../src/types";

// Custom test function for testing the SQLFunction base class
const TestValidation = z.tuple([
    z.string(),
    z.number()
]);

class TestFunction extends SQLFunction<string, typeof TestValidation> {
    public validation(): typeof TestValidation {
        return TestValidation;
    }

    public subResolve(args: ValidatedArgs<this>): string {
        const [str, num] = args;
        return `${str}-${num}`;
    }
}

// Single argument test function
const SingleArgValidation = z.tuple([z.string()]);

class SingleArgTestFunction extends SQLFunction<string, typeof SingleArgValidation> {
    public validation(): typeof SingleArgValidation {
        return SingleArgValidation;
    }

    public subResolve(args: ValidatedArgs<this>): string {
        const [str] = args;
        return str.toUpperCase();
    }
}

describe("SQLFunction base class", () => {
    const testRow: MeshedRow = {
        main: {
            text: "hello",
            number: 42,
            nested: {
                value: "world"
            }
        }
    };

    describe("Basic functionality", () => {
        it("should store function name", () => {
            const fn = new TestFunction("CustomName", [new ResolvedProperty("test"), new ResolvedProperty(123)]);
            expect(fn.name).toBe("CustomName");
        });

        it("should store function arguments", () => {
            const arg1 = new ResolvedProperty("test");
            const arg2 = new ResolvedProperty(456);
            const fn = new TestFunction("TEST", [arg1, arg2]);
            expect(fn.arguments).toEqual([arg1, arg2]);
        });
    });

    describe("Validation and resolution", () => {
        it("should validate and resolve arguments correctly", () => {
            const fn = new TestFunction("TEST", [new ResolvedProperty("hello"), new ResolvedProperty(42)]);
            expect(fn.resolve(testRow)).toBe("hello-42");
        });

        it("should resolve field properties", () => {
            const fn = new TestFunction("TEST", [new FieldProperty("main", "text"), new FieldProperty("main", "number")]);
            expect(fn.resolve(testRow)).toBe("hello-42");
        });

        it("should handle nested field access", () => {
            const fn = new SingleArgTestFunction("TEST", [new FieldProperty("main", "nested.value")]);
            expect(fn.resolve(testRow)).toBe("WORLD");
        });

        it("should throw validation error for wrong argument types", () => {
            const fn = new TestFunction("TEST", [new ResolvedProperty("hello"), new ResolvedProperty("not-a-number")]);
            expect(() => fn.resolve(testRow)).toThrow();
        });

        it("should throw validation error for wrong number of arguments", () => {
            const fn = new TestFunction("TEST", [new ResolvedProperty("hello")]);
            expect(() => fn.resolve(testRow)).toThrow();
        });

        it("should throw validation error for too many arguments", () => {
            const fn = new TestFunction("TEST",
                [new ResolvedProperty("hello"),
                new ResolvedProperty(42),
                new ResolvedProperty("extra")]
            );
            expect(() => fn.resolve(testRow)).toThrow();
        });
    });

    describe("Static methods", () => {
        beforeAll(() => {
            SQLFactory.register("TEST", TestFunction);
        });

        it("should create function from FunctionProperty using make()", () => {
            const functionProperty = {
                name: "TEST",
                args: [new ResolvedProperty("test"), new ResolvedProperty(123)]
            };

            const fn = SQLFactory.make(functionProperty as any);
            expect(fn).toBeInstanceOf(TestFunction);
            expect((fn as TestFunction).name).toBe("TEST");
            expect(fn.resolve(testRow)).toBe("test-123");
        });

        it("should throw error for unknown function", () => {
            const functionProperty = {
                name: "UNKNOWN",
                args: []
            };

            expect(() => SQLFactory.make(functionProperty as any)).toThrow("Unknown function UNKNOWN");
        });
    });

    describe("Nested function calls (depth-first resolution)", () => {
        beforeAll(() => {
            // Register the functions we'll use for testing
            SQLFactory.register("LENGTH", LengthFunction);
            SQLFactory.register("TRIM", TrimFunction);
        });

        it("should resolve nested functions depth-first: LENGTH(TRIM('   foo   ')) = 3", () => {
            // Create TRIM function with padded string
            const trimFunction = new TrimFunction("TRIM", [new ResolvedProperty("   foo   ")]);

            // Create LENGTH function that takes the TRIM function as argument
            const lengthFunction = new LengthFunction("LENGTH", [new FunctionProperty("TRIM", [new ResolvedProperty("   foo   ")])]);

            // This should resolve depth-first:
            // 1. TRIM("   foo   ") resolves to "foo"
            // 2. LENGTH("foo") resolves to 3
            expect(lengthFunction.resolve(testRow)).toBe(3);
        });

        it("should handle multiple levels of nesting", () => {
            // Create a chain: LENGTH(TRIM(TRIM("  foo  ")))
            const lengthFunction = new LengthFunction("LENGTH", [new FunctionProperty("TRIM", [new FunctionProperty("TRIM", [new ResolvedProperty("  foo  ")])])]);

            expect(lengthFunction.resolve(testRow)).toBe(3);
        });

        it("should resolve nested functions with field properties", () => {
            // Test with field that contains padded string
            const testRowWithPadded: MeshedRow = {
                main: {
                    paddedText: "   hello world   "
                }
            };

            const trimFunction = new TrimFunction("TRIM", [new FieldProperty("main", "paddedText")]);
            const lengthFunction = new LengthFunction("LENGTH", [new FunctionProperty("TRIM", [new FieldProperty("main", "paddedText")])]);

            // "   hello world   ".trim() = "hello world" (length 11)
            expect(lengthFunction.resolve(testRowWithPadded)).toBe(11);
        });

        it("should demonstrate that functions are resolved as Property objects", () => {
            // Show that a function can be passed as a Property to another function
            const trimFunction = new TrimFunction("TRIM", [new ResolvedProperty("  test  ")]);

            // Verify that trimFunction is indeed a Property (extends Property class)
            expect(trimFunction).toBeInstanceOf(SQLFunction);

            // And that it can be used as an argument to another function
            const lengthFunction = new LengthFunction("LENGTH", [new FunctionProperty("TRIM", [new ResolvedProperty("  test  ")])]);
            expect(lengthFunction.resolve(testRow)).toBe(4); // "test".length = 4
        });

        it("should work with FunctionProperty objects (simulating parser output)", () => {
            // This simulates what the parser would create
            const trimFunctionProperty = new FunctionProperty("TRIM", [new ResolvedProperty("  nested  ")]);
            const lengthFunctionProperty = new FunctionProperty("LENGTH", [trimFunctionProperty]);

            // Create the actual function from the property
            const lengthFunction = SQLFactory.make(lengthFunctionProperty);

            expect(lengthFunction.resolve(testRow)).toBe(6); // "nested".length = 6
        });
    });
});
