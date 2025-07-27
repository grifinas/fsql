import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.tuple([z.number()]);

export class AbsFunction extends SQLFunction<number, typeof Validation> {
  public validation(): typeof Validation {
    return Validation;
  }

  public subResolve(args: ValidatedArgs<this>): number {
    const [num] = args;

    return Math.abs(num);
  }
}

SQLFactory.register("ABS", AbsFunction);
