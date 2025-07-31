import { SourceData, source } from "./source";
import { FilterFunction, Property, DataSource } from "@entities";
import { logger } from "@utils";
import { mesh } from "./mesh";
import { select } from "./select";
import { order } from "./order";
import { limit } from "./limit";
import { filter } from "./filter";
import { write } from "./write";
import { groupBy } from "./groupBy";

export class AST {
  public all: boolean = true;
  public fields: Property[] = [];
  public mainfile: DataSource | undefined;
  public joinFiles: Record<string, DataSource> = {};
  public where: FilterFunction = FilterFunction.Empty();
  public order: [string, number] | undefined = undefined;
  public groupBy: string[] = [];
  public readonly variables: Record<string, object[]> = {};
  public into: DataSource | undefined = undefined;
  public limit: number | undefined = undefined;
  public offset: number = 0;
  public next: AST | null = null;

  async execute(): Promise<object[]> {
    logger.log("Executing", this);

    const data = this.flow(await source(this), [
      mesh,
      filter,
      groupBy,
      select,
      order,
      limit,
      write,
    ]);

    if (this.next) {
      for (const [key, value] of Object.entries(this.variables)) {
        this.next.assignVariable(key, value);
      }
      return this.next.execute();
    } else {
      return data;
    }
  }

  addAnd(fn: FilterFunction) {
    if (this.where.isEmpty()) {
      this.where = fn;
      return;
    }

    this.where = this.where.and(fn);
  }

  assignVariable(name: string, data: object[]) {
    if (!name.startsWith("@")) {
      throw new Error(`Variable name must start with @, got: ${name}`);
    }
    this.variables[name] = data;
  }

  setMain(dataSource: DataSource) {
    this.mainfile = dataSource;
  }

  addJoin(source: DataSource) {
    //TODO feels a bit off, should we check for duplicate joins?
    if (this.joinFiles[source.ref()]) {
      throw new Error(`Join file '${source.ref()}' has already been added`);
    }
    this.joinFiles[source.ref()] = source;
  }

  addField(property: Property) {
    // Check for duplicate fields when no alias is provided
    if (this.fields.some((f) => f.ref() === property.ref())) {
      throw new Error(`Field '${property.ref()}' has already been added`);
    }

    this.all = false;
    this.fields.push(property);
  }

  setLimit(limit: number) {
    this.limit = limit;
  }

  setOffset(offset: number) {
    this.offset = offset;
  }

  setGroupBy(fields: string[]) {
    this.groupBy = fields;
  }

  // eslint-disable-next-line
  flow(data: SourceData[], steps: Function[]) {
    for (const step of steps) {
      data = step(data, this);
      logger.debug(step.name, data);
    }

    return data;
  }
}
