import { MeshedRow } from "../meshData";
import { logger } from "./logger";
import { pathValue } from "./pathValue";

export function getMeshedRowValue(row: MeshedRow, source: string | null, field: string): unknown {
    if (source) {
        const sourceData = row[source];
        if (!sourceData) {
            throw new Error(`No source ${source}`);
        }

        const result = pathValue(sourceData, field);
        if (!result.result) {
            throw new Error(`No field ${field} on source ${source}`);
        }
        return result.value;
    }

    const results = Object.values(row).map(sourceData => {
        const result = pathValue(sourceData, field);
        if (result.result) {
            return result.value;
        }
    }).filter((result): result is unknown => result !== undefined);

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