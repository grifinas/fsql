import { AST } from "../entities/ast";
import { MeshedRow } from "../types";

export function filterData(mapped: MeshedRow[], ast: AST): MeshedRow[] {
    if (!ast.where) return mapped;

    return mapped.filter((row: MeshedRow) => ast.where.resolve(row));
}