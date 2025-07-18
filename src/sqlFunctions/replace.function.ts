import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { resolveValue } from "../utils/getMeshedRowValue";
import { SQLFunction } from "./sqlFunction";

export class ReplaceFunction extends SQLFunction<string> {
    public resolve(row: MeshedRow): string {
        cliAssert(this.arguments.length === 3, "REPLACE function requires exactly three arguments: string, search, replace");
        const [str, search, replace] = this.arguments;

        const { value: strValue } = resolveValue(str, row);
        const { value: searchValue } = resolveValue(search, row);
        const { value: replaceValue } = resolveValue(replace, row);

        cliAssert(typeof strValue === "string", "REPLACE function requires a string as first argument");
        cliAssert(typeof searchValue === "string", "REPLACE function requires a string as second argument");
        cliAssert(typeof replaceValue === "string", "REPLACE function requires a string as third argument");
        
        return strValue.split(searchValue).join(replaceValue);
    }
}
