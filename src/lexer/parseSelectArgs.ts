import { AST } from "../ast";
import { TokenStream } from "../tokenStream";
import { Type } from "../token";
import { parseProperty } from "./parseProperty";
import { logger } from "../utils/logger";
import { withAlias } from './parseAlias';

export function parseSelectArgs(ast: AST, stream: TokenStream) {
    logger.info("parseSelectArgs", stream.toStringFromCurrent());
    if (!stream.advanceIf(Type.word, "SELECT")) {
        stream.unexpectedToken(undefined, "SELECT");
    }
    if (stream.advanceIf(Type.special, "*")) {
        return;
    }

    do {
        const prop = withAlias(parseProperty, stream);
        logger.debug("Parsed property", prop, stream.toStringFromCurrent());
        ast.addField(prop);
    } while (stream.advanceIf(Type.comma))
} 