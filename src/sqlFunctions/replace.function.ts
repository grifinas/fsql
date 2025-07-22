import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.tuple([
    z.string(),
    z.string(),
    z.string()
]);

export class ReplaceFunction extends SQLFunction<string, typeof Validation> {
    public validation(): typeof Validation {
        return Validation;
    }

    public subResolve(args: ValidatedArgs<this>): string {
        const [str, search, replace] = args;

        return str.split(search).join(replace);
    }
}

SQLFactory.register("REPLACE", ReplaceFunction);
