import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { resolveValue } from "../utils/getMeshedRowValue";
import { SQLFunction, SQLFunctions } from "./sqlFunction";

export class AbsFunction extends SQLFunction<number> {
    public resolve(row: MeshedRow): number {
        cliAssert(this.arguments.length === 1, "ABS function requires exactly one argument");
        const [num] = this.arguments;

        const { value } = resolveValue(num, row);
        cliAssert(typeof value === "number", "ABS function requires a number argument");
        
        return Math.abs(value);
    }
}

SQLFunctions.set("ABS", AbsFunction);
