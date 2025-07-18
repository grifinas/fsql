import { ResolvedProperty } from "../../src/filterFunction";
import { MeshedRow } from "../../src/meshData";
import { UpperFunction } from "../../src/sqlFunctions/upper.function";

describe("SQLFunction base class", () => {
    const testRow: MeshedRow = {
        main: {
            nested: {
                text: "Nested Text"
            }
        }
    };

    it("should store function name", () => {
        const fn = new UpperFunction("CustomName", { value: "test" } as ResolvedProperty);
        expect(fn.name).toBe("CustomName");
    });

    it("should store function arguments", () => {
        const arg = { value: "test" } as ResolvedProperty;
        const fn = new UpperFunction("UPPER", arg);
        expect(fn.arguments).toEqual([arg]);
    });

    it("should handle nested field access", () => {
        const fn = new UpperFunction("UPPER", { source: "main", field: "nested.text" });
        expect(fn.resolve(testRow)).toBe("NESTED TEXT");
    });
});
