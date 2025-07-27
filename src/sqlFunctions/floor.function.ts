import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.tuple([z.number()]);

export class FloorFunction extends SQLFunction<number, typeof Validation> {
  public validation(): typeof Validation {
    return Validation;
  }

  public subResolve(args: ValidatedArgs<this>): number {
    const [num] = args;

    return Math.floor(num);
  }
}

SQLFactory.register("FLOOR", FloorFunction);
