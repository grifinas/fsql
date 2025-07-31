import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.tuple([z.string()]);

export class ParseFunction extends SQLFunction<object, typeof Validation> {
  public validation(): typeof Validation {
    return Validation;
  }

  public subResolve(args: ValidatedArgs<this>): object {
    const [str] = args;

    return JSON.parse(str);
  }
}

SQLFactory.register("PARSE", ParseFunction);
