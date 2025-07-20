import { MeshedRow } from "../meshData";
import { Scalar } from "../types";
import { logger } from "./logger";
import { pathValue } from "./pathValue";

//TODO this file is very core and should not be in utils
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