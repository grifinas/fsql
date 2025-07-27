import { SourceData, source } from "./source";
import { FilterFunction, Property, DataSource } from "@entities";
import { logger } from "@utils";
import { mesh } from "./mesh";
import { select } from "./select";
import { order } from "./order";
import { filter } from "./filter";
import { write } from "./write";

export type JoinMap = Record<string, { where: FilterFunction; source: DataSource }>;

export class AST {
  public all: boolean = true;
  public fields: Property[] = [];
  public mainfile: DataSource | undefined;
  public joinFiles: JoinMap = {};
  public where: FilterFunction = FilterFunction.Empty();
  public order: [string, number] | undefined = undefined;
  public readonly variables: Record<string, object[]> = {};
  public into: DataSource | undefined = undefined;
  public next: AST | null = null;

  async execute(): Promise<object[]> {
    logger.info("Executing", this);

    const data = this.flow(await source(this), [
      mesh,
      filter,
      select,
      order,
      write
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

  // eslint-disable-next-line
  flow(data: SourceData[], steps: Function[]) {
    for (const step of steps) {
      data = step(data, this);
      logger.debug(step.name, data);
    }
    
    return data;
  }
}