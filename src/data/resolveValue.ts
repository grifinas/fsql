import { Property, ResolvedProperty, FieldProperty, FunctionProperty } from "../entities";
import { SQLFactory } from "../sqlFunctions";
import { MeshedRow, Scalar } from "../types";
import { logger, pathValue } from "../utils";

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

export function getMeshedRowValue(row: MeshedRow, source: string | null, field: string): Scalar {
    if (source) {
        const sourceData = row[source];
        if (!sourceData) {
            throw new Error(`No source ${source}`);
        }

        const result = pathValue(sourceData, field);
        if (!result.result) {
            throw new Error(`No field ${field} on source ${source}`);
        }
        return result.value as Scalar;
    }

    const results = Object.values(row).map(sourceData => {
        const result = pathValue(sourceData, field);
        if (result.result) {
            return result.value as Scalar;
        }
    }).filter((result): result is Scalar => result !== undefined);

    if (results.length === 0) {
        logger.debug('No field on any source', { field, row, source });
        throw new Error(`No field ${field} on any source`);
    } else if (results.length === 1) {
        return results[0];
    } else {
        logger.debug('Ambiguous field', { field, row, source });
        throw new Error(`Ambiguous field ${field}`);
    }
}