import { Property, ResolvedProperty } from "./property";
import { resolveValue } from "@data";
import { logger } from "@utils";
import { MeshedRow } from "@types";

export type Operator = '<' | '>' | '=';

export class FilterFunction {
    private left: FilterFunction | Property;
    private right: FilterFunction | Property;
    private operator: Operator;

    constructor(left: FilterFunction | Property, operator: Operator, right: FilterFunction | Property) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    static Empty() {
        return new FilterFunction(new ResolvedProperty(true), "=", new ResolvedProperty(true));
    }

    isEmpty(): boolean {
        return this.left instanceof ResolvedProperty && this.right instanceof ResolvedProperty && this.left.value === true && this.right.value === true && this.operator === "=";
    }

    resolve(row: MeshedRow): boolean {
        if (this.left instanceof FilterFunction) {
            this.left = new ResolvedProperty(this.left.resolve(row));
        }
        if (this.right instanceof FilterFunction) {
            this.right = new ResolvedProperty(this.right.resolve(row));
        }

        const rleft = resolveValue(this.left, row);
        const rright = resolveValue(this.right, row);
        const result = this.compare(
            rleft,
            rright
        );

        logger.debug("Filter result", row, rleft, this.operator, rright, result);

        return result;
    }

    getLeft() {
        return this.left;
    }

    getRight() {
        return this.right;
    }

    getOperator() {
        return this.operator;
    }

    and(fn: FilterFunction) {
        //Not quite correct, but it works for now, in the future we need to do something else
        return new FilterFunction(this, "=", fn);
    }

    private compare(a: ResolvedProperty, b: ResolvedProperty) {
        switch (this.operator) {
            case ">":
                return Number(a.value) > Number(b.value);
            case "<":
                return Number(a.value) < Number(b.value);
            case "=":
                return a.value === b.value;
            default:
                throw new Error(`Unknown comparator: ${this.operator}`);
        }
    }
}