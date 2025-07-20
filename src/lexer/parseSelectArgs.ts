import { AST } from "../ast";
import { TokenStream } from "../tokenStream";
import { Type } from "../token";
import { RESERVED_WORDS } from "./constants";
import { parseProperty } from "./parseProperty";
import { logger } from "../utils/logger";
import { FieldProperty } from "../property";

export function parseSelectArgs(ast: AST, stream: TokenStream) {
    logger.info("parseSelectArgs", stream.toStringFromCurrent());
    if (!stream.advanceIf(Type.word, "SELECT")) {
        stream.unexpectedToken(undefined, "SELECT");
    }
    if (stream.advanceIf(Type.special, "*")) {
        return;
    }

    do {
        const prop = parseProperty(stream);
        logger.debug("Parsed property", prop, stream.toStringFromCurrent());
        if (prop instanceof FieldProperty) {
            if (stream.get().is(Type.word, "as")) {
                const aliasToken = stream.next();
                if (aliasToken.isIn(RESERVED_WORDS)) {
                    stream.unexpectedToken();
                }
                const alias = aliasToken.value;
                ast.addField(prop.field, alias);
                stream.advance();
            } else {
                ast.addField(prop.field);
            }
        } else {
            throw new Error("Unsuported value based properties at this point: " + stream.toStringFromCurrent());
        }
    } while (stream.advanceIf(Type.comma))
} 