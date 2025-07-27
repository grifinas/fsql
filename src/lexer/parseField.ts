import { TokenStream } from "../tokenStream";
import { FieldProperty, FunctionProperty, Property, ResolvedProperty } from "../property";
import { ANY, RESERVED_WORDS, Symbols } from "./constants";
import { logger } from "../utils/logger";

export function parseField(stream: TokenStream): Property {
    const parts: string[] = [];
    let start = stream.getIndex();

    while (true) {
        const token = stream.get();
        if (stream.advanceIf(ANY.STRING)) {
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
        if (!stream.popNextIf(ANY.DOT)) {
            break;
        } else {
            stream.advance();
        }
    }

    stream.advance();

    if (stream.advanceIf(Symbols.OPEN_PARENTHESIS)) {
        stream.setIndex(start);
        return parseFunction(stream);
    }

    const fieldName = parts.join('.');
    logger.debug("Field name is", fieldName);
    if (RESERVED_WORDS.some(token => token.value?.toLocaleLowerCase() === fieldName.toLocaleLowerCase())) {
        stream.unexpectedToken("Any non-reserved word");
    }

    return new FieldProperty(null, fieldName);
}

function getValueFromStream(stream: TokenStream): string | number | boolean {
    const token = stream.get();
    if (token.is(ANY.NUMBER)) {
        return Number(token.value);
    } else if (token.is(ANY.WORD)) {
        return ['true', 'false'].includes(token.value.toLocaleLowerCase()) ? token.value === 'true' : token.value;
    } else if (token.is(ANY.STRING)) {
        return token.value;
    } else {
        stream.unexpectedToken([
            ANY.NUMBER,
            ANY.WORD,
            ANY.STRING,
        ]);
    }
}

function parseFunction(stream: TokenStream): FunctionProperty {
    stream.assert(ANY.WORD);
    const name = stream.get().value;
    stream.advance();
    if (!stream.advanceIf(Symbols.OPEN_PARENTHESIS)) {
        stream.unexpectedToken([
            Symbols.OPEN_PARENTHESIS,
        ]);
    }

    const args: Property[] = [];
    do {
        args.push(parseField(stream));
    } while (stream.advanceIf(ANY.COMMA));

    if (!stream.advanceIf(Symbols.CLOSE_PARENTHESIS)) {
        stream.unexpectedToken([
            Symbols.CLOSE_PARENTHESIS,
        ]);
    }

    return new FunctionProperty(name, args);
}