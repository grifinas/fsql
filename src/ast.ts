import { meshData, MeshedRow } from "./meshData";
import { sourceData } from "./sourceData";
import { FilterFunction } from "./filterFunction";
import { selectData } from "./selectData";
import { logger } from "./utils/logger";

export interface AliasedPropperty {
  field: string;
  alias: string | null;
}

export type JoinMap = Record<string, { where: FilterFunction; alias: string | null }>;

export class AST {
  public all: boolean = true;
  public fields: AliasedPropperty[] = [];
  public mainfile: AliasedPropperty | undefined;
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

  setMain(prop: AliasedPropperty) {
    if (prop.alias && !prop.alias.startsWith("@")) {
      throw new Error(`Invalid alias: ${prop.alias}. Table aliases must start with @`);
    }
    this.mainfile = prop;
  }

  addJoin(prop: AliasedPropperty, where?: FilterFunction) {
    if (prop.alias && !prop.alias.startsWith("@")) {
      throw new Error(`Invalid alias: ${prop.alias}. Table aliases must start with @`);
    }
    this.joinFiles[prop.field] = { where: where || FilterFunction.Empty(), alias: prop.alias };
  }

  addField(field: string, alias?: string) {
    const effectiveAlias = alias || field.split('.').pop()!;

    // Check for duplicate fields when no alias is provided
    if (!alias && this.fields.some(f => f.field === field && !f.alias)) {
      throw new Error(`Field '${field}' has already been added`);
    }

    // Check for duplicate aliases
    if (this.fields.some(f => f.alias === effectiveAlias)) {
      throw new Error(`Alias '${effectiveAlias}' has already been used`);
    }

    this.all = false;
    this.fields.push({ field, alias: effectiveAlias });
  }
}
