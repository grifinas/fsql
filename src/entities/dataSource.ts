import { IAlias } from "@types";
import { FilterFunction } from "./filterFunction";

export abstract class DataSource {
  public __type: string = "DataSource";
  public filter: FilterFunction = FilterFunction.Empty();

  abstract ref(): string;

  setFilter(filter: FilterFunction): this {
    this.filter = filter;
    return this;
  }
}

export class FileDataSource extends DataSource implements IAlias {
  private alias: string | null = null;

  constructor(public filePath: string) {
    super();
  }

  setAlias(alias: string): this {
    if (!alias.startsWith("@")) {
      throw new Error(
        `Invalid alias: ${alias}. Table aliases must start with @`,
      );
    }
    this.alias = alias;
    return this;
  }

  getAlias(): string | null {
    return this.alias;
  }

  ref(): string {
    return this.alias || this.filePath;
  }
}

export class VariableDataSource extends DataSource {
  constructor(public variableName: string) {
    if (!variableName.startsWith("@")) {
      throw new Error(
        `Invalid variable name: ${variableName}. Variable names must start with @`,
      );
    }
    super();
  }

  ref(): string {
    return this.variableName;
  }
}
