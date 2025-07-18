import { MeshedRow } from "./meshData";
import { resolveValue } from "./utils/getMeshedRowValue";
import { logger } from "./utils/logger";

export interface FieldProperty {
    source: string | null;
    field: string;
}

export type Scalar = string | number | boolean;

export interface ResolvedProperty {
    value: Scalar;
}

export type Operator = '<' | '>' | '=';

export class FilterFunction {
    private left: FilterFunction | FieldProperty | ResolvedProperty;
    private right: FilterFunction | FieldProperty | ResolvedProperty;
    private operator: Operator;

    constructor(left: FilterFunction | FieldProperty | ResolvedProperty, operator: Operator, right: FilterFunction | FieldProperty | ResolvedProperty) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    static Empty() {
        return new FilterFunction({ value: true }, "=", { value: true });
    }

    isEmpty(): boolean {
        return 'value' in this.left && 'value' in this.right && this.left.value === true && this.right.value === true && this.operator === "=";
    }

    resolve(row: MeshedRow): boolean {
        if (this.left instanceof FilterFunction) {
            this.left = { value: this.left.resolve(row) };
        }
        if (this.right instanceof FilterFunction) {
            this.right = { value: this.right.resolve(row) };
        }

        const result = this.compare(
            resolveValue(this.left, row),
            resolveValue(this.right, row)
        )

        logger.info("Resolved", row, this.left, this.operator, this.right, result);

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