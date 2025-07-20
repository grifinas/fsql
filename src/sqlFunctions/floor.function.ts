import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { resolveValue } from "../utils/getMeshedRowValue";
import { SQLFunction, SQLFunctions } from "./sqlFunction";

export class FloorFunction extends SQLFunction<number> {
    public resolve(row: MeshedRow): number {
        cliAssert(this.arguments.length === 1, "FLOOR function requires exactly one argument");
        const [num] = this.arguments;

        const { value } = resolveValue(num, row);
        cliAssert(typeof value === "number", "FLOOR function requires a number argument");
        
        return Math.floor(value);
    }
}

SQLFunctions.set("FLOOR", FloorFunction);
