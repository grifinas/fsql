import { MeshedRow } from "./meshData";
import { Property, ResolvedProperty, FieldProperty, FunctionProperty, Scalar } from "./property";
import { SQLFactory } from "./sqlFunctions/sqlFactory";
import { getMeshedRowValue } from "./utils/getMeshedRowValue";

export function resolveValue(value: Property, row: MeshedRow): ResolvedProperty {
    if (value instanceof ResolvedProperty) {
        return value;
    }

    if (value instanceof FieldProperty) {
        return new ResolvedProperty(getMeshedRowValue(row, value.source, value.field));
    }

    if (value instanceof FunctionProperty) {
        const fn = SQLFactory.make<Scalar>(value);

        return new ResolvedProperty(fn.resolve(row));
    }

    throw new Error(`Unknown property type ${value}, ${typeof value}, ${value.constructor.name}`);
}