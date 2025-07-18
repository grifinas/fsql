import { FilterFunction, FieldProperty, ResolvedProperty, Operator } from "../src/filterFunction";
import { MeshedRow } from "../src/meshData";

describe("FilterFunction", () => {
    describe("Empty", () => {
        it("should create an empty filter that always returns true", () => {
            const filter = FilterFunction.Empty();
            expect(filter.isEmpty()).toBe(true);
            expect(filter.resolve({} as MeshedRow)).toBe(true);
        });
    });

    describe("Basic comparisons", () => {
        const testCases = [
            {
                operator: "=",
                left: { value: 5 },
                right: { value: 5 },
                expected: true
            },
            {
                operator: "=",
                left: { value: 5 },
                right: { value: 6 },
                expected: false
            },
            {
                operator: ">",
                left: { value: 6 },
                right: { value: 5 },
                expected: true
            },
            {
                operator: ">",
                left: { value: 5 },
                right: { value: 6 },
                expected: false
            },
            {
                operator: "<",
                left: { value: 5 },
                right: { value: 6 },
                expected: true
            },
            {
                operator: "<",
                left: { value: 6 },
                right: { value: 5 },
                expected: false
            }
        ];

        testCases.forEach(({ operator, left, right, expected }) => {
            it(`should handle ${operator} operator correctly`, () => {
                const filter = new FilterFunction(
                    left as ResolvedProperty,
                    operator as Operator,
                    right as ResolvedProperty
                );
                expect(filter.resolve({} as MeshedRow)).toBe(expected);
            });
        });

        it("should throw on unknown operator", () => {
            const filter = new FilterFunction(
                { value: 5 },
                "invalid" as Operator,
                { value: 5 }
            );
            expect(() => filter.resolve({} as MeshedRow)).toThrow("Unknown comparator: invalid");
        });
    });

    describe("Field property resolution", () => {
        const testRow: MeshedRow = {
            main: {
                id: 1,
                value: 42,
                active: true
            },
            join: {
                id: 1,
                score: 100
            }
        };

        it("should resolve field properties from main source", () => {
            const filter = new FilterFunction(
                { source: "main", field: "value" } as FieldProperty,
                "=",
                { value: 42 } as ResolvedProperty
            );
            expect(filter.resolve(testRow)).toBe(true);
        });

        it("should resolve field properties from joined source", () => {
            const filter = new FilterFunction(
                { source: "join", field: "score" } as FieldProperty,
                "=",
                { value: 100 } as ResolvedProperty
            );
            expect(filter.resolve(testRow)).toBe(true);
        });

        it("should handle boolean values", () => {
            const filter = new FilterFunction(
                { source: "main", field: "active" } as FieldProperty,
                "=",
                { value: true } as ResolvedProperty
            );
            expect(filter.resolve(testRow)).toBe(true);
        });
    });

    describe("Nested filters (AND)", () => {
        const row: MeshedRow = {
            main: { value: 5, other: 10 }
        };

        it("should handle nested AND conditions", () => {
            const filter1 = new FilterFunction(
                { source: "main", field: "value" },
                "=",
                { value: 5 }
            );
            const filter2 = new FilterFunction(
                { source: "main", field: "other" },
                "=",
                { value: 10 }
            );

            const combined = filter1.and(filter2);
            expect(combined.resolve(row)).toBe(true);
        });

        it("should handle nested AND conditions with false result", () => {
            const filter1 = new FilterFunction(
                { source: "main", field: "value" },
                "=",
                { value: 5 }
            );
            const filter2 = new FilterFunction(
                { source: "main", field: "other" },
                "=",
                { value: 11 } // Wrong value
            );

            const combined = filter1.and(filter2);
            expect(combined.resolve(row)).toBe(false);
        });
    });

    describe("Getters", () => {
        it("should return the correct left operand, operator, and right operand", () => {
            const left = { value: 5 };
            const operator = "=";
            const right = { value: 5 };
            const filter = new FilterFunction(left, operator, right);

            expect(filter.getLeft()).toBe(left);
            expect(filter.getOperator()).toBe(operator);
            expect(filter.getRight()).toBe(right);
        });
    });
});
