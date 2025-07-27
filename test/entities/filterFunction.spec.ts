import { FilterFunction, Operator } from "../../src/entities/filterFunction";
import { ResolvedProperty, FieldProperty } from "../../src/entities/property";
import { MeshedRow } from "../../src/types";

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
                left: new ResolvedProperty(5),
                right: new ResolvedProperty(5),
                expected: true
            },
            {
                operator: "=",
                left: new ResolvedProperty(5),
                right: new ResolvedProperty(6),
                expected: false
            },
            {
                operator: ">",
                left: new ResolvedProperty(6),
                right: new ResolvedProperty(5),
                expected: true
            },
            {
                operator: ">",
                left: new ResolvedProperty(5),
                right: new ResolvedProperty(6),
                expected: false
            },
            {
                operator: "<",
                left: new ResolvedProperty(5),
                right: new ResolvedProperty(6),
                expected: true
            },
            {
                operator: "<",
                left: new ResolvedProperty(6),
                right: new ResolvedProperty(5),
                expected: false
            }
        ];

        testCases.forEach(({ operator, left, right, expected }) => {
            it(`should handle ${operator} operator correctly`, () => {
                const filter = new FilterFunction(
                    left,
                    operator as Operator,
                    right
                );
                expect(filter.resolve({} as MeshedRow)).toBe(expected);
            });
        });

        it("should throw on unknown operator", () => {
            const filter = new FilterFunction(
                new ResolvedProperty(5),
                "invalid" as Operator,
                new ResolvedProperty(5)
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
                new FieldProperty("main", "value"),
                "=",
                new ResolvedProperty(42)
            );
            expect(filter.resolve(testRow)).toBe(true);
        });

        it("should resolve field properties from joined source", () => {
            const filter = new FilterFunction(
                new FieldProperty("join", "score"),
                "=",
                new ResolvedProperty(100)
            );
            expect(filter.resolve(testRow)).toBe(true);
        });

        it("should handle boolean values", () => {
            const filter = new FilterFunction(
                new FieldProperty("main", "active"),
                "=",
                new ResolvedProperty(true)
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
                new FieldProperty("main", "value"),
                "=",
                new ResolvedProperty(5)
            );
            const filter2 = new FilterFunction(
                new FieldProperty("main", "other"),
                "=",
                new ResolvedProperty(10)
            );

            const combined = filter1.and(filter2);
            expect(combined.resolve(row)).toBe(true);
        });

        it("should handle nested AND conditions with false result", () => {
            const filter1 = new FilterFunction(
                new FieldProperty("main", "value"),
                "=",
                new ResolvedProperty(5)
            );
            const filter2 = new FilterFunction(
                new FieldProperty("main", "other"),
                "=",
                new ResolvedProperty(11) // Wrong value
            );

            const combined = filter1.and(filter2);
            expect(combined.resolve(row)).toBe(false);
        });
    });

    describe("Getters", () => {
        it("should return the correct left operand, operator, and right operand", () => {
            const left = new ResolvedProperty(5);
            const operator = "=";
            const right = new ResolvedProperty(5);
            const filter = new FilterFunction(left, operator, right);

            expect(filter.getLeft()).toBe(left);
            expect(filter.getOperator()).toBe(operator);
            expect(filter.getRight()).toBe(right);
        });
    });
});
