import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.tuple([]);

export class NowFunction extends SQLFunction<Date, typeof Validation> {
    public validation(): typeof Validation {
        return Validation;
    }

    public subResolve(args: ValidatedArgs<this>): Date {
        return new Date();
    }
}

SQLFactory.register("NOW", NowFunction);
