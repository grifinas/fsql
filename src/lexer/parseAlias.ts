import { TokenStream } from "../tokenizer";
import { KEYWORD, RESERVED_WORDS, Symbols } from "./constants";
import { IAlias } from '../types';
import { logger } from "../utils";

export function parseVarAlias(stream: TokenStream): string | null {
    if (!stream.done() && stream.get().is(KEYWORD.AS)) {
        stream.assertNext(Symbols.AT);
        const aliasToken = stream.next();
        if (aliasToken.isIn(RESERVED_WORDS)) {
            stream.unexpectedToken("Any non-reserved word");
        }
        stream.advance();

        logger.debug("Alias is", aliasToken.value);
        return `@${aliasToken.value}`;
    }

    return null;
}

export function parseAlias(stream: TokenStream): string | null {
    if (!stream.done() && stream.get().is(KEYWORD.AS)) {
        const aliasToken = stream.next();
        if (aliasToken.isIn(RESERVED_WORDS)) {
            stream.unexpectedToken("Any non-reserved word");
        }
        stream.advance();

        logger.debug("Alias is", aliasToken.value);
        return aliasToken.value;
    }

    return null;
}

export function withAlias<T extends IAlias>(fn: (stream: TokenStream) => T, stream: TokenStream): T {
    const aliasable = fn(stream);
    const alias = parseAlias(stream);
    if (alias) {
        aliasable.setAlias(alias);
    }
    return aliasable;
}

export function withVarAlias<T extends IAlias>(fn: (stream: TokenStream) => T, stream: TokenStream): T {
    const aliasable = fn(stream);
    const alias = parseVarAlias(stream);
    if (alias) {
        aliasable.setAlias(alias);
    }
    return aliasable;
}