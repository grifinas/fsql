import { fileUtils } from "./utils/file";
export type WhereFunction = (row: object) => boolean;

interface FieldAlias {
  field: string;
  alias: string;
}

export class AST {
  public all: boolean = true;
  public fields: FieldAlias[] = [];
  public mainfile: string = "";
  public joinFiles: Record<string, WhereFunction> = {};
  public where: WhereFunction = () => true;
  public order: [string, number] | undefined = undefined;
  public readonly variables: Record<string, object[]> = {};
  public intoName: string | undefined = undefined;
  public next: AST | null = null;

  async execute(): Promise<object[]> {
    const data: object[] = await this.getMainData();

    for (const [filePath, whereFn] of Object.entries(this.joinFiles)) {
      const joinData = await this.getJoinData(filePath);
      const filteredJoin = joinData.filter(whereFn);

      const oldData: object[] = data.splice(0, data.length);
      for (const joinRow of filteredJoin) {
        for (const row of oldData) {
          data.push({ ...row, ...joinRow });
        }
      }
    }

    const mapped = data.map((row) => {
      if (this.all) return row;

      const m: Record<string, any> = {};
      this.fields.forEach(({ field, alias }) => {
        const parts = field.split(".");
        let value: any = row;
        for (const part of parts) {
          value = value[part];
        }
        m[alias] = value;
      });

      return m;
    });
    const filtered = mapped.filter(row => {
      const result = this.where(row);
      return result;
    });

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

    if (this.intoName) {
      this.assignVariable(this.intoName, filtered);
    }

    if (this.next) {
      Object.entries(this.variables).forEach(([key, value]) => {
        (this.next as AST).assignVariable(key, value);
      });
      return this.next.execute();
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

  assignVariable(name: string, data: object[]) {
    this.variables[name] = data;
  }

  addField(field: string, alias?: string) {
    this.all = false;
    this.fields.push({ field, alias: alias || field });
  }

  private async getMainData(): Promise<object[]> {
    if (this.mainfile.startsWith("@")) {
      return this.variables[this.mainfile.slice(1)];
    } else {
      const unknown: unknown = await fileUtils.readJson(this.mainfile);
      return Array.isArray(unknown) ? unknown : [unknown as object];
    }
  }

  private async getJoinData(filePath: string): Promise<object[]> {
    if (filePath.startsWith('@')) {
      return this.variables[filePath.slice(1)];
    }
    const unknown: unknown = await fileUtils.readJson(filePath);
    return Array.isArray(unknown) ? unknown : [unknown as object];
  }
}
