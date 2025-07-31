import { SQLFactory } from "./sqlFactory";
import { SQLFunction } from "./sqlFunction";
import * as z from "zod";
import * as process from "node:process";

const Validation = z.tuple([]);

export class CwdFunction extends SQLFunction<string, typeof Validation> {
  public validation(): typeof Validation {
    return Validation;
  }

  public subResolve(): string {
    return process.cwd();
  }
}

SQLFactory.register("CWD", CwdFunction);
