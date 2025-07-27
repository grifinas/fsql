import { FieldProperty, FunctionProperty, ResolvedProperty } from '../src/entities/property';
import { resolveValue } from '../src/data/resolveValue';
describe("resolveValue", () => {
    it("should resolve field property", () => {
        const result = resolveValue(new FieldProperty(null, "foo"), { "@m": { foo: 1 } });
        expect(result.value).toEqual(1);
    });

    it("should resolve resolved property", () => {
        const result = resolveValue(new ResolvedProperty(1), { "@m": { foo: 2 } });
        expect(result.value).toEqual(1);
    });

    it("should resolve function property", () => {
        const result = resolveValue(new FunctionProperty("length", [new FieldProperty(null, "foo")]), { "@m": { foo: "bar" } });
        expect(result.value).toEqual(3);
    });
});