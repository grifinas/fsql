import { MeshedRow } from "./meshData";
import { AliasedPropperty } from "./ast";
import { getMeshedRowValue } from "./utils/getMeshedRowValue";

export function selectData(rows: MeshedRow[], fields: AliasedPropperty[]): object[] {
    return rows.map((row: MeshedRow) => {
        return colapse(row, fields);
    });
}

function colapse(row: MeshedRow, fields: AliasedPropperty[]): object {
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

    for (let { field, alias } of fields) {
        const [first, ...rest] = field.split('.');
        const source = first.startsWith('@') ? first : null;

        m[alias || field] = getMeshedRowValue(row, source, source ? rest.join('.') : field);
    }
    return m;
}