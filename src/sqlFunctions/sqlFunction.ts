import { Property } from "@entities";
import * as z from "zod";
import { resolveValue } from "@data";
import { logger } from "@utils";
import { MeshedRow, Scalar } from "@types";
import { Resolvable } from './sqlFactory';

export type ValidatedArgs<SQL extends SQLFunction> = z.infer<
  ReturnType<SQL["validation"]>
>;

export abstract class SQLFunction<
  R extends Scalar | unknown = unknown,
  V extends z.ZodSchema = z.ZodSchema,
> implements Resolvable<R> {
  arguments: Property[];

  constructor(
    public name: string,
    fnArguments: Property[] = [],
  ) {
    this.arguments = fnArguments;
  }

  public abstract validation(): V;

  protected abstract subResolve(args: ValidatedArgs<this>, row: MeshedRow): R;

  public resolve(row: MeshedRow): R {
    const validation = this.validation();

    const resolved = this.arguments.map((arg) => resolveValue(arg, [row]));

    try {
      //TODO maybe frame errors a bit better
      const args = validation.parse(resolved.map((r) => r.value));
      return this.subResolve(args, row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(formatZodError(this, error));
      }
      throw new Error(`Error resolving ${this.name} function: ${error}`);
    }
  }
}

export abstract class AggregateFunction<
  R extends Scalar | unknown = unknown,
  V extends z.ZodSchema = z.ZodSchema,
> implements Resolvable<R> {
  arguments: Property[];

  constructor(
    public name: string,
    fnArguments: Property[] = [],
  ) {
    this.arguments = fnArguments;
  }

  public abstract validation(): V;

  protected abstract subResolveAggregate(
    args: z.infer<V>[],
    rows: MeshedRow[],
  ): R;

  public resolve(): R {
    throw new Error(
      `${this.name.toUpperCase()} is an aggregate function and can only be resolved over a group of rows`,
    );
  }

  public resolveAggregate(rows: MeshedRow[]): R {
    const validation = this.validation();

    const resolved = rows.map((row) =>
      this.arguments.map((arg) => resolveValue(arg, [row]).value),
    );

    try {
      const args = resolved.map((rowArgs) => validation.parse(rowArgs));
      return this.subResolveAggregate(args, rows);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(formatZodError(this as unknown as SQLFunction, error));
      }
      throw new Error(`Error resolving ${this.name} aggregate function: ${error}`);
    }
  }
}

function formatZodError(sqlFunction: SQLFunction, error: z.ZodError): string {
  const name = sqlFunction.constructor.name.replace("Function", "");
  const result = error.issues
    .map((issue) => {
      if (issue.path.length === 1 && typeof issue.path[0] === "number") {
        const argIndex = issue.path[0];
        const ordinalSuffix =
          argIndex === 0
            ? "st"
            : argIndex === 1
              ? "nd"
              : argIndex === 2
                ? "rd"
                : "th";
        const argumentString = `${argIndex + 1}${ordinalSuffix} argument`;

        let stringIssue = "";
        if (issue.code === "invalid_type") {
          stringIssue = `to be of type ${issue.expected}`;
        }
        //Usual case
        return `${name} function requires ${argumentString} ${stringIssue}`;
      } else if (issue.path.length === 0 && issue.code === "too_big") {
        return `${name} function requires less than or equal to ${issue.maximum} arguments`;
      } else if (issue.path.length === 0 && issue.code === "too_small") {
        return `${name} function requires more than or equal to ${issue.minimum} arguments`;
      } else {
        logger.error("zod error", issue);
        return issue.message;
      }
    })
    .join(" and ");
  return result;
}