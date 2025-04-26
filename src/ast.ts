import * as fs from "fs/promises";

export type WhereFunction = (row: object) => boolean;

export class AST {
  public all: boolean = false;
  public columns: string[] = [];
  public mainfile: string = "";
  public joinFiles: Record<string, WhereFunction> = {};
  public where: WhereFunction = () => true;
  public order: [string, number] | undefined = undefined;

  async execute() {
    const content = await fs.readFile(this.mainfile);
    const unknown: unknown = JSON.parse(content.toString());
    const data: object[] = Array.isArray(unknown) ? unknown : [unknown];

    for (const [filePath, whereFn] of Object.entries(this.joinFiles)) {
      const joinContent = await fs.readFile(filePath);
      const joinUnknown: unknown = JSON.parse(joinContent.toString());
      const joinData: object[] = Array.isArray(joinUnknown)
        ? joinUnknown
        : [joinUnknown];
      const filteredJoin = joinData.filter(whereFn);

      const oldData: object[] = data.splice(0, data.length);
      for (const joinRow of filteredJoin) {
        for (const row of oldData) {
          data.push({ ...row, ...joinRow });
        }
      }
    }

    const mapped = this.all
      ? data
      : data.map((row) => {
          const m: Record<string, unknown> = {};

          for (const column of this.columns) {
            if (column in row) {
              m[column] = row[column as keyof typeof row];
            } else {
              throw new Error(`Unknown column: ${column}`);
            }
          }

          return m;
        });
    const filtered = mapped.filter(this.where);

    if (this.order) {
      const [key, value] = this.order;
      return filtered.sort((a, b) => {
        if (!(key in a) || !(key in b))
          throw new Error(`No ${key} in some rows`);
        const v1 = a[key as keyof typeof a];
        const v2 = b[key as keyof typeof b];
        if (typeof v1 === "string") {
          return value * (v1 as string).localeCompare(v2);
        } else if (typeof v1 === "number") {
          return value * (v1 - v2);
        } else {
          throw new Error(`Can not compare values of type: ${typeof v1}`);
        }
      });
    }

    return filtered;
  }

  addAnd(fn: WhereFunction) {
    const before = this.where;
    this.where = (row: object) => {
      const already = before(row);
      if (!already) return false;
      return fn(row);
    };
  }
}
