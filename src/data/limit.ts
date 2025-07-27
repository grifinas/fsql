import { AST } from './ast';

export function limit(mapped: object[], ast: AST): object[] {
    if (ast.limit === undefined && ast.offset <= 0) return mapped;

    const { offset, limit } = ast

    // Apply offset first
    let result = mapped.slice(offset);

    // Apply limit if specified
    if (limit !== undefined) {
        result = result.slice(0, limit);
    }

    return result;
}
