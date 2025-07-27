import { AST } from "../ast";
import { TokenStream } from "../tokenStream";
import { parseProperty } from "./parseProperty";
import { logger } from "../utils/logger";
import { withAlias } from './parseAlias';
import { KEYWORD, ANY, Symbols } from './constants';

export function parseSelectArgs(ast: AST, stream: TokenStream) {
    logger.info("parseSelectArgs", stream.toStringFromCurrent());
    if (!stream.advanceIf(KEYWORD.SELECT)) {
        stream.unexpectedToken([KEYWORD.SELECT]);
    }
    if (stream.advanceIf(Symbols.ALL)) {
        return;
    }

    do {
        const prop = withAlias(parseProperty, stream);
        logger.debug("Parsed property", prop, stream.toStringFromCurrent());
        ast.addField(prop);
    } while (stream.advanceIf(ANY.COMMA))
} 