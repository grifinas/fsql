import { FunctionProperty, Property } from "../entities";
import { MeshedRow } from "../types";

type Constructor = new (name: string, fnArguments: Property[]) => Resolvable;
export interface Resolvable<T = unknown> {
    resolve(row: MeshedRow): T;
}

const SQLFunctions = new Map<string, Constructor>();

export class SQLFactory {
    static make<T>(property: FunctionProperty): Resolvable<T> {
        const ctor = SQLFunctions.get(property.name.toUpperCase());

        if (!ctor) throw new Error(`Unknown function ${property.name} registered functions: ${Array.from(SQLFunctions.keys())}`);

        return new ctor(property.name, property.args) as Resolvable<T>;
    }

    static register(name: string, constructor: Constructor) {
        SQLFunctions.set(name.toUpperCase(), constructor);
    }
}
