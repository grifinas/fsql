import { cliAssert } from "../cliAssert";
import { MeshedRow } from "../meshData";
import { SQLFunction, SQLFunctions } from "./sqlFunction";

export class NowFunction extends SQLFunction<Date> {
    public resolve(_row: MeshedRow): Date {
        cliAssert(this.arguments.length === 0, "NOW function does not accept any arguments");
        return new Date();
    }
}

SQLFunctions.set("NOW", NowFunction);
