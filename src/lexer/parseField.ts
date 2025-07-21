import { TokenStream } from "../tokenStream";
import { Type } from "../token";
import { ResolvedProperty, FieldProperty } from '../filterFunction';

export function parseField(stream: TokenStream): FieldProperty | ResolvedProperty {
    const parts: string[] = [];

    while (true) {
        const value = getValueFromStream(stream);
        if (typeof value === 'string') {
            parts.push(value);
        } else if (parts.length === 0) {
            stream.advance();
            return { value };
        } else {
            parts.push(String(value));
        }
        if (!stream.popNextIf(Type.dot)) {
            break;
        } else {
            stream.advance();
        }
    }

    stream.advance();

    return { source: null, field: parts.join('.') };
}

function getValueFromStream(stream: TokenStream): string | number | boolean {
    const token = stream.get();
    if (token.is(Type.number)) {
        return Number(token.value);
    } else if (token.is(Type.word)) {
        return ['true', 'false'].includes(token.value.toLocaleLowerCase()) ? token.value === 'true' : token.value;
    } else {
        stream.unexpectedToken();
    }
}