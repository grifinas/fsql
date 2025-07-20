import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.tuple([
    z.string()
]);

export class LengthFunction extends SQLFunction<number, typeof Validation> {
    public validation(): typeof Validation {
        return Validation;
    }

    public subResolve(args: ValidatedArgs<this>): number {
        const [str] = args;

        return str.length;
    }
}

SQLFactory.register("LENGTH", LengthFunction);
