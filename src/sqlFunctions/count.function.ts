import * as z from "zod";
import { SQLFactory } from "./sqlFactory";
import { AggregateFunction } from "./sqlFunction";
import { logger } from '@utils';

const Validation = z.tuple([z.any()]);

export class CountFunction extends AggregateFunction<number, typeof Validation> {
  public validation(): typeof Validation {
    return Validation;
  }

  protected subResolveAggregate(args: z.infer<typeof Validation>[]): number {
    let count = 0;

    logger.debug("Count args", args)

    for (const rowArgs of args) {
      const value = rowArgs[0];
      if (value !== null && value !== undefined) {
        count++;
      }
    }

    return count;
  }
}

SQLFactory.register("COUNT", CountFunction);