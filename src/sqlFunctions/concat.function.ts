import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.array(z.coerce.string());

export class ConcatFunction extends SQLFunction<string, typeof Validation> {
  public validation(): typeof Validation {
    return Validation;
  }

  public subResolve(args: ValidatedArgs<this>): string {
    return args.join('');
  }
}

SQLFactory.register("CONCAT", ConcatFunction);
