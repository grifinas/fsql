import { FunctionProperty, Property } from "@entities";
import { MeshedRow } from "@types";

type Constructor = new (name: string, fnArguments: Property[]) => Resolvable;
export interface Resolvable<T = unknown> {
  resolve(row: MeshedRow): T;
}

const SQLFunctions = new Map<string, Constructor>();

export class SQLFactory {
  static getConstructor(property: FunctionProperty): Constructor {
    const ctor = SQLFunctions.get(property.name.toUpperCase());

    if (!ctor)
      throw new Error(
        `Unknown function ${property.name} registered functions: ${Array.from(SQLFunctions.keys())}`,
      );

    return ctor;
  }

  static isAggregate(ctor: Constructor): boolean {
    return typeof (ctor as unknown as { prototype: { resolveAggregate?: unknown } }).prototype
      .resolveAggregate === "function";
  }

  static isAggregateProperty(property: FunctionProperty): boolean {
    return SQLFactory.isAggregate(SQLFactory.getConstructor(property));
  }

  static make<T>(property: FunctionProperty): Resolvable<T> {
    const ctor = SQLFactory.getConstructor(property);

    return new ctor(property.name, property.args) as Resolvable<T>;
  }

  static list(): string[] {
    return Array.from(SQLFunctions.keys());
  }

  static register(name: string, constructor: Constructor) {
    SQLFunctions.set(name.toUpperCase(), constructor);
  }
}
