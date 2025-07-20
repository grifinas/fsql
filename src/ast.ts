import { meshData, MeshedRow } from "./meshData";
import { sourceData } from "./sourceData";
import { FilterFunction } from "./filterFunction";
import { selectData } from "./selectData";
import { logger } from "./utils/logger";
import { Property } from "./property";
import { DataSource } from "./dataSource";

export type JoinMap = Record<string, { where: FilterFunction; source: DataSource }>;

export class AST {
  public all: boolean = true;
  public fields: Property[] = [];
  public mainfile: DataSource | undefined;
  public joinFiles: JoinMap = {};
  public where: FilterFunction | undefined;
  public order: [string, number] | undefined = undefined;
  public readonly variables: Record<string, object[]> = {};
  public intoName: string | undefined = undefined;
  public next: AST | null = null;

  async execute(): Promise<object[]> {
    logger.info("Executing", this);
    if (!this.mainfile) {
      throw new Error("No main file specified");
    }

    const sources = await sourceData(this.mainfile, this.joinFiles, this.variables);
    logger.info("Sources", sources);
    const meshed = meshData(sources);
    logger.info("Meshed", meshed);
    const filtered = this.filter(meshed);
    logger.info("Filtered", filtered);
    const mapped: object[] = selectData(filtered, this.fields);
    logger.info("Mapped", mapped);

    if (this.order) {
      const [key, value] = this.order;
      return mapped.sort((a: object, b: object) => {
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
      this.assignVariable(this.intoName, mapped);
    }

    if (this.next) {
      Object.entries(this.variables).forEach(([key, value]) => {
        (this.next as AST).assignVariable(key, value);
      });
      return this.next.execute();
    } else {
      return mapped;
    }
  }

  addAnd(fn: FilterFunction) {
    if (!this.where) {
      this.where = fn;
      return;
    }

    this.where = this.where.and(fn);
  }

  filter(mapped: MeshedRow[]): MeshedRow[] {
    const where = this.where!;
    if (!where) return mapped;

    return mapped.filter((row: MeshedRow) => where.resolve(row));
  }

  assignVariable(name: string, data: object[]) {
    this.variables[name] = data;
  }

  setMain(dataSource: DataSource) {
    this.mainfile = dataSource;
  }

  addJoin(source: DataSource, where?: FilterFunction) {
    this.joinFiles[source.ref()] = { where: where || FilterFunction.Empty(), source };
  }

  addField(property: Property) {
    // Check for duplicate fields when no alias is provided
    if (this.fields.some(f => f.ref() === property.ref())) {
      throw new Error(`Field '${property.ref()}' has already been added`);
    }

    this.all = false;
    this.fields.push(property);
  }
}
