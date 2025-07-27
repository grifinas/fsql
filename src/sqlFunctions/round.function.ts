import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.union([
  z.tuple([z.number()]),
  z.tuple([z.number(), z.number()]),
]);

export class RoundFunction extends SQLFunction<number, typeof Validation> {
  public validation(): typeof Validation {
    return Validation;
  }

  public subResolve(args: ValidatedArgs<this>): number {
    const [num, decimals] = args;

    if (decimals !== undefined) {
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
    }

    return Math.round(num);
  }
}

SQLFactory.register("ROUND", RoundFunction);
