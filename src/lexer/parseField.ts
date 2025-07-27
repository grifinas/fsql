import { TokenStream } from "../tokenizer/tokenStream";
import { FieldProperty, FunctionProperty, Property, ResolvedProperty } from "../entities/property";
import { ANY, RESERVED_WORDS, Symbols } from "./constants";
import { logger } from "../utils/logger";

export function parseField(stream: TokenStream): Property {
    const parts: string[] = [];
    let start = stream.getIndex();

    do {
        const token = stream.get(ANY.NUMBER, ANY.WORD, ANY.STRING);
        stream.advance();
        if (token.is(ANY.STRING)) {
            return new ResolvedProperty(token.value);
        } else {
            parts.push(token.value);
        }
    } while (stream.advanceIf(ANY.DOT))

    if (stream.advanceIf(Symbols.OPEN_PARENTHESIS)) {
        stream.setIndex(start);
        return parseFunction(stream);
    }

    if (parts.length === 1) {
        const [arg] = parts;
        if (['true', 'false'].includes(arg.toLocaleLowerCase())) {
            return new ResolvedProperty(arg === 'true');
        } else if (!isNaN(Number(arg))) {
            return new ResolvedProperty(Number(arg));
        }
    }

    const fieldName = parts.join('.');
    logger.debug("Field name is", fieldName);
    if (RESERVED_WORDS.some(token => token.value?.toLocaleLowerCase() === fieldName.toLocaleLowerCase())) {
        stream.unexpectedToken("Any non-reserved word");
    }

    return new FieldProperty(null, fieldName);
}

function parseFunction(stream: TokenStream): FunctionProperty {
    const name = stream.get(ANY.WORD).value;
    stream.next(Symbols.OPEN_PARENTHESIS);
    stream.advance();

    const args: Property[] = [];
    do {
        args.push(parseField(stream));
    } while (stream.advanceIf(ANY.COMMA));

    stream.get(Symbols.CLOSE_PARENTHESIS);
    stream.advance();

    return new FunctionProperty(name, args);
}