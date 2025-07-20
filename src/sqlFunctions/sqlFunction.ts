import { FieldProperty, ResolvedProperty, Scalar } from "../filterFunction";
import { MeshedRow } from "../meshData";

type Constructor = new (name: string, ...fnArguments: (FieldProperty | ResolvedProperty)[]) => SQLFunction;

export const SQLFunctions = new Map<string, Constructor>();

export abstract class SQLFunction<R = unknown> {
    arguments: (FieldProperty | ResolvedProperty)[];

    constructor(public name: string, ...fnArguments: (FieldProperty | ResolvedProperty)[]) {
        this.arguments = fnArguments;
    }

    public abstract resolve(row: MeshedRow): R;
}

//TODO
// export class AggregateFunction extends SQLFunction {
    
// }