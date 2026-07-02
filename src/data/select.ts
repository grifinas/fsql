import { FunctionProperty, Property } from "@entities";
import { resolveValue } from "./resolveValue";
import { MeshedRow } from "@types";
import { logger } from "@utils";
import { AST } from "./ast";
import { SQLFactory } from "@sqlFunctions";

export function select(rows: MeshedRow[][], ast: AST): object[] {
  logger.debug("Selecting data", { rows, fields: ast.fields });
  if (rows.length === 0) return [];

  const hasAggregates = ast.fields.some((f) => {
    if (!(f instanceof FunctionProperty)) return false;
    return SQLFactory.isAggregateProperty(f);
  });
  const hasGroupBy = (ast.groupBy?.length ?? 0) > 0;

  if (hasGroupBy || hasAggregates) {
    return rows.map((groupRows) => projectGroup(groupRows, ast.fields));
  } else {
    return rows.flat().map((row) => projectGroup([row], ast.fields));
  }
}

function projectGroup(groupRows: MeshedRow[], fields: Property[]): object {
  const m: Record<string, unknown> = {};

  const representativeRow = groupRows[groupRows.length - 1];
  if (!representativeRow) return m;

  //All case
  if (fields.length === 0) {
    for (let source in representativeRow) {
      const data = representativeRow[source];
      for (let field in data) {
        m[field] = data[field as keyof typeof data];
      }
    }

    return m;
  }

  for (let field of fields) {
    m[field.ref()] = resolveValue(field, groupRows).value;
  }
  return m;
}
