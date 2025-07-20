import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.tuple([
    z.string()
]);

export class RTrimFunction extends SQLFunction<string, typeof Validation> {
    public validation(): typeof Validation {
        return Validation;
    }

    public subResolve(args: ValidatedArgs<this>): string {
        const [str] = args;

        return str.trimEnd();
    }
}

SQLFactory.register("RTRIM", RTrimFunction);
