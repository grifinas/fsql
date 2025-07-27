import { AST } from './ast';

export function order(mapped: object[], ast: AST): object[] {
    if (!ast.order) return mapped;

    const [key, value] = ast.order;
    return mapped.sort((a: object, b: object) => {
        if (!(key in a) || !(key in b))
            throw new Error(`No ${key} in some rows`);
        const v1 = a[key as keyof typeof a];
        const v2 = b[key as keyof typeof b];
        if (typeof v1 === "string") {
            return value * (v1 as string).localeCompare(v2);
        } else if (typeof v1 === "number") {
            return value * (v1 - v2);
        } else {
            throw new Error(`Can not compare values of type: ${typeof v1}`);
        }
    });
}
