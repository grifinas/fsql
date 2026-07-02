import * as z from "zod";
import { SQLFactory } from "./sqlFactory";
import { AggregateFunction } from "./sqlFunction";

const Validation = z.tuple([z.number()]);

export class SumFunction extends AggregateFunction<number, typeof Validation> {
  public validation(): typeof Validation {
    return Validation;
  }

  protected subResolveAggregate(args: z.infer<typeof Validation>[]): number {
    let total = 0;

    for (const rowArgs of args) {
      total += rowArgs[0];
    }

    return total;
  }
}

SQLFactory.register("SUM", SumFunction);
