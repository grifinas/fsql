import { AST } from "./ast";
import { MeshedRow } from "@types";

export function filter(mapped: MeshedRow[], ast: AST): MeshedRow[] {
  if (!ast.where) return mapped;

  return mapped.filter((row: MeshedRow) => ast.where.resolve(row));
}
