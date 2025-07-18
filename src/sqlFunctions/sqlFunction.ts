import { FieldProperty, ResolvedProperty, Scalar } from "../filterFunction";
import { MeshedRow } from "../meshData";

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