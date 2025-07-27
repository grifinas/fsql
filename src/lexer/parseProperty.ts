import { TokenStream } from "../tokenStream";
import { FieldProperty, Property, ResolvedProperty } from "../property";
import { parseField } from "./parseField";
import { parseVariable } from "./parseVariable";
import { Type } from "../types";

export function parseProperty(stream: TokenStream): Property {
    const varName = parseVariable(stream);
    if (varName) {
        stream.assert(Type.dot).advance();
        const field = parseField(stream);
        if (field instanceof FieldProperty) {
            field.source = varName;
            return field
        } else {
            return new ResolvedProperty(varName);
        }
    }

    return parseField(stream);
}