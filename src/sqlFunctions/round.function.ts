import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { resolveValue } from "../utils/getMeshedRowValue";
import { SQLFunction, SQLFunctions } from "./sqlFunction";

export class RoundFunction extends SQLFunction<number> {
    public resolve(row: MeshedRow): number {
        cliAssert(this.arguments.length === 1 || this.arguments.length === 2, 
            "ROUND function requires one or two arguments: number, [decimal places]");
        const [num, decimals] = this.arguments;

        const { value: numValue } = resolveValue(num, row);
        cliAssert(typeof numValue === "number", "ROUND function requires a number as first argument");

        if (decimals) {
            const { value: decValue } = resolveValue(decimals, row);
            cliAssert(typeof decValue === "number", "ROUND function requires a number as second argument");
            const factor = Math.pow(10, decValue);
            return Math.round(numValue * factor) / factor;
        }
        
        return Math.round(numValue);
    }
}

SQLFunctions.set("ROUND", RoundFunction);
