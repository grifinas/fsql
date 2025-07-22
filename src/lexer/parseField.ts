import { TokenStream } from "../tokenStream";
import { Type } from "../token";
import { FieldProperty, FunctionProperty, Property, ResolvedProperty } from "../property";
import { RESERVED_WORDS } from "./constants";

export function parseField(stream: TokenStream): Property {
    const parts: string[] = [];
    let start = stream.getIndex();

    while (true) {
        const token = stream.get();
        if (stream.advanceIf(Type.string)) {
            return new ResolvedProperty(token.value);
        }
        const value = getValueFromStream(stream);
        if (typeof value === 'string') {
            parts.push(value);
        } else if (parts.length === 0) {
            stream.advance();
            return new ResolvedProperty(value);
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

    if (stream.advanceIf(Type.parenthesis, '(')) {
        stream.setIndex(start);
        return parseFunction(stream);
    }

    const fieldName = parts.join('.');
    if (RESERVED_WORDS.some(token => token.value.toLocaleLowerCase() === fieldName.toLocaleLowerCase())) {
        stream.unexpectedToken();
    }

    return new FieldProperty(null, fieldName);
}

function getValueFromStream(stream: TokenStream): string | number | boolean {
    const token = stream.get();
    if (token.is(Type.number)) {
        return Number(token.value);
    } else if (token.is(Type.word)) {
        return ['true', 'false'].includes(token.value.toLocaleLowerCase()) ? token.value === 'true' : token.value;
    } else if (token.is(Type.string)) {
        return token.value;
    } else {
        stream.unexpectedToken();
    }
}

function parseFunction(stream: TokenStream): FunctionProperty {
    stream.assert(Type.word);
    const name = stream.get().value;
    stream.advance();
    if (!stream.advanceIf(Type.parenthesis, '(')) {
        stream.unexpectedToken();
    }

    const args: Property[] = [];
    do {
        args.push(parseField(stream));
    } while (stream.advanceIf(Type.comma));

    if (!stream.advanceIf(Type.parenthesis, ')')) {
        stream.unexpectedToken();
    }

    return new FunctionProperty(name, args);
}