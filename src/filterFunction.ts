import { MeshedRow } from "./meshData";
import { SQLFunctions } from "./sqlFunctions/sqlFunction";
import { resolveValue } from './utils/getMeshedRowValue';
import { logger } from "./utils/logger";

export interface FieldProperty {
    source: string | null;
    field: string;
}

export type Scalar = string | number | boolean;

export interface ResolvedProperty {
    value: Scalar;
}

export interface FunctionProperty {
    name: string;
    arguments: (FieldProperty | ResolvedProperty | FunctionProperty)[];
}

export type Operator = '<' | '>' | '=';

export class FilterFunction {
    private left: FilterFunction | FieldProperty | ResolvedProperty | FunctionProperty;
    private right: FilterFunction | FieldProperty | ResolvedProperty | FunctionProperty;
    private operator: Operator;

    constructor(left: FilterFunction | FieldProperty | ResolvedProperty | FunctionProperty, operator: Operator, right: FilterFunction | FieldProperty | ResolvedProperty | FunctionProperty) {
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
        //TODO functions
        if ('name' in this.left) {
            const ctor = SQLFunctions.get(this.left.name);
            if (!ctor) throw new Error(`Unknown function ${this.left.name}`);

            const fn = new ctor(this.left.name, ...this.left.arguments);
            
            this.left = { value: fn.resolve(row) };
        }
        if ('name' in this.right) {
            const ctor = SQLFunctions.get(this.right.name);
            if (!ctor) throw new Error(`Unknown function ${this.right.name}`);

            const fn = new ctor(this.right.name, ...this.right.arguments);
            
            this.right = { value: fn.resolve(row) };
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