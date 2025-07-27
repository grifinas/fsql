import { AST } from "@data";
import { TokenStream } from "@tokenizer";
import { parseProperty } from "./parseProperty";
import { logger } from "@utils";
import { withAlias } from './parseAlias';
import { KEYWORD, ANY, Symbols } from './constants';

export function parseSelectArgs(ast: AST, stream: TokenStream) {
    logger.info("parseSelectArgs", stream.toStringFromCurrent());
    stream.consume(KEYWORD.SELECT);
    if (stream.advanceIf(Symbols.ALL)) {
        return;
    }

    do {
        const property = withAlias(parseProperty, stream);
        logger.debug("Parsed property", property, stream.toStringFromCurrent());
        ast.addField(property);
    } while (stream.advanceIf(ANY.COMMA))
} 