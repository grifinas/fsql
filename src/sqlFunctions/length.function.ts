import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { resolveValue } from "../utils/getMeshedRowValue";
import { SQLFunction, SQLFunctions } from "./sqlFunction";

export class LengthFunction extends SQLFunction<number> {
    public resolve(row: MeshedRow): number {
        cliAssert(this.arguments.length === 1, "Length function requires exactly one argument");
        const [first] = this.arguments;

        const { value } = resolveValue(first, row);

        cliAssert(typeof value === "string", "Length function requires a string argument");
        return value.length;
    }
}

SQLFunctions.set("LENGTH", LengthFunction);
