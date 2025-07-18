import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { resolveValue } from "../utils/getMeshedRowValue";
import { SQLFunction } from "./sqlFunction";

export class CeilFunction extends SQLFunction<number> {
    public resolve(row: MeshedRow): number {
        cliAssert(this.arguments.length === 1, "CEIL function requires exactly one argument");
        const [num] = this.arguments;

        const { value } = resolveValue(num, row);
        cliAssert(typeof value === "number", "CEIL function requires a number argument");
        
        return Math.ceil(value);
    }
}
