import { Property } from "../entities/property";
import { resolveValue } from "../resolveValue";
import { MeshedRow } from "../types";
import { logger } from "../utils/logger";
import { AST } from "../entities/ast";

export function selectData(rows: MeshedRow[], ast: AST): object[] {
    logger.debug("Selecting data", { rows, fields: ast.fields });
    return rows.map((row: MeshedRow) => {
        return colapse(row, ast.fields);
    });
}

function colapse(row: MeshedRow, fields: Property[]): object {
    const m: Record<string, unknown> = {};
    if (fields.length === 0) {
        for (let source in row) {
            const data = row[source];
            for (let field in data) {
                m[field] = data[field as keyof typeof data];
            }
        }    

        return m;
    }

    for (let field of fields) {
        m[field.ref()] = resolveValue(field, row).value;
    }
    return m;
}