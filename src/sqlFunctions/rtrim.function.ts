import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { resolveValue } from "../utils/getMeshedRowValue";
import { SQLFunction, SQLFunctions } from "./sqlFunction";

export class RTrimFunction extends SQLFunction<string> {
    public resolve(row: MeshedRow): string {
        cliAssert(this.arguments.length === 1, "RTRIM function requires exactly one argument");
        const [first] = this.arguments;

        const { value } = resolveValue(first, row);
        cliAssert(typeof value === "string", "RTRIM function requires a string argument");
        
        return value.trimEnd();
    }
}

SQLFunctions.set("RTRIM", RTrimFunction);
