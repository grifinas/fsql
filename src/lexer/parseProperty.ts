import { Type } from "../token";
import { TokenStream } from "../tokenStream";
import { FieldProperty, ResolvedProperty } from "../filterFunction";
import { parseField } from "./parseField";
import { parseVariable } from "./parseVariable";

export function parseProperty(stream: TokenStream): FieldProperty | ResolvedProperty {
    const varName = parseVariable(stream);
    if (varName) {
        stream.assert(Type.dot).advance();
        const fieldValue = parseField(stream);
        if ('field' in fieldValue) {
            return { source: varName, field: fieldValue.field };
        } else {
            return fieldValue;
        }
    }

    return parseField(stream);
}