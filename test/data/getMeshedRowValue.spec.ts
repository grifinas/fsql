import { getMeshedRowValue } from "@src/data/resolveValue";

describe("getMeshedRowValue", () => {
    it("should throw error if field doesn't exist", () => {
        expect(() => getMeshedRowValue({
            "@m": { foo: 1, bar: "bar1" }
        }, "@m", "baz")).toThrow("No field baz on source @m");
    });

    it("should throw error if source doesn't exist", () => {
        expect(() => getMeshedRowValue({
            "@m": { foo: 1, bar: "bar1" }
        }, "@j", "foo")).toThrow("No source @j");
    });

    it("should return value if source and field exist", () => {
        expect(getMeshedRowValue({
            "@m": { foo: 1, bar: "bar1" }
        }, "@m", "foo")).toBe(1);
    });

    it("should infer source if it is null", () => {
        expect(getMeshedRowValue({
            "@m": { foo: 1, bar: "bar1" }
        }, null, "foo")).toBe(1);
    });

    it("should infer source even with multiple files", () => {
        expect(getMeshedRowValue({
            "@m": { foo: 1, bar: "bar1" },
            "@j": { baz: 2, foz: "bar2" }
        }, null, "foo")).toBe(1);
    });

    it("should throw error if field is ambiguous", () => {
        expect(() => getMeshedRowValue({
            "@m": { foo: 1, bar: "bar1" },
            "@j": { foo: 2, foz: "bar2" }
        }, null, "foo")).toThrow("Ambiguous field foo");
    });

    it("should resolve deep fields", () => {
        expect(getMeshedRowValue({
            "@m": { foo: { bar: 1 } }
        }, null, "foo.bar")).toBe(1);
    });
});