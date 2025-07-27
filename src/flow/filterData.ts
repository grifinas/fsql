import { FilterFunction } from "../entities/filterFunction";
import { MeshedRow } from "../types";

export function filterData(mapped: MeshedRow[], where: FilterFunction): MeshedRow[] {
    if (!where) return mapped;

    return mapped.filter((row: MeshedRow) => where.resolve(row));
}