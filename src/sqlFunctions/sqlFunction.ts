import { MeshedRow } from "../meshData";
import { Property, Scalar } from "../property";
import * as z from "zod";
import { resolveValue } from "../resolveValue";

export type ValidatedArgs<SQL extends SQLFunction> = z.infer<ReturnType<SQL["validation"]>>;

export abstract class SQLFunction<R extends Scalar | unknown = unknown, V extends z.ZodSchema = z.ZodSchema> {
    arguments: Property[];

    constructor(public name: string, fnArguments: Property[] = []) {
        this.arguments = fnArguments;
    }

    public abstract validation(): V;
    protected abstract subResolve(args: ValidatedArgs<this>, row: MeshedRow): R;

    public resolve(row: MeshedRow): R {
        const validation = this.validation();

        const resolved = this.arguments.map(arg => resolveValue(arg, row));

        //TODO maybe frame errors a bit better
        const args = validation.parse(resolved.map(r => r.value));

        return this.subResolve(args, row);
    }
}

//TODO
// export class AggregateFunction extends SQLFunction {
    
// }