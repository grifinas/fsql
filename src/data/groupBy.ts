import { MeshedRow, Scalar } from "@types";
import { AST } from "./ast";
import { logger } from "@utils";
import { getMeshedRowValue } from "./resolveValue";

export function groupBy(data: MeshedRow[], ast: AST): MeshedRow[] {
  logger.debug("Grouping", ast.groupBy);
  if (ast.groupBy.length === 0) {
    return data;
  }

  return recursiveGroup(data, ast.groupBy);
}

function recursiveGroup(data: MeshedRow[], groupBy: string[]): MeshedRow[] {
  const [group, ...rest] = groupBy;

  const groups = new Map<Scalar, MeshedRow[]>();
  for (const row of data) {
    const key = getMeshedRowValue(row, null, group);
    const g = groups.get(key) || [];
    g.push(row);
    groups.set(key, g);
  }

  const result: MeshedRow[] = [];
  groups.forEach((rows) => {
    if (rest.length > 0) {
      rows = recursiveGroup(rows, rest);
    }
    result.push(rows.pop()!);
  });

  return result;
}
