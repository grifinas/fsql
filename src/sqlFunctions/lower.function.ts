import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { resolveValue } from "../utils/getMeshedRowValue";
import { SQLFunction } from "./sqlFunction";

export class LowerFunction extends SQLFunction<string> {
    public resolve(row: MeshedRow): string {
        cliAssert(this.arguments.length === 1, "Lower function requires exactly one argument");
        const [first] = this.arguments;

        const { value } = resolveValue(first, row);

        cliAssert(typeof value === "string", "Lower function requires a string argument");
        return value.toLowerCase();
    }
}
