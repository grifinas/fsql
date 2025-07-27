import { sourceData } from "../flow/sourceData";
import { FilterFunction } from "./filterFunction";
import { logger } from "../utils/logger";
import { Property } from "./property";
import { DataSource, FileDataSource, VariableDataSource } from "./dataSource";
import { fileUtils } from "../utils/file";
import { meshData } from "../flow/meshData";
import { selectData } from "../flow/selectData";
import { orderData } from "../flow/orderData";
import { filterData } from "../flow/filterData";

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

    const sources = await sourceData(this);
    logger.info("Sources", sources);
    const meshed = meshData(sources);
    logger.info("Meshed", meshed);
    const filtered = filterData(meshed, this.where);
    logger.info("Filtered", filtered);
    const selected: object[] = selectData(filtered, this.fields);
    logger.info("Selected", selected);
    const ordered = orderData(selected, this.order);
    logger.info("Ordered", ordered);

    if (this.into) {
      if (this.into instanceof VariableDataSource) {
        this.assignVariable(this.into.variableName, ordered);
      } else if (this.into instanceof FileDataSource) {
        fileUtils.writeJson(this.into.filePath, ordered);
      }
    }

    if (this.next) {
      for (const [key, value] of Object.entries(this.variables)) {
        this.next.assignVariable(key, value);
      }
      return this.next.execute();
    } else {
      return ordered;
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
}
