import { TokenStream } from "../tokenStream";
import { AliasedPropperty } from "../ast";
import { Type } from "../token";
import { parseVariable } from "./parseVariable";
import { logger } from "../utils/logger";

export function parseFile(stream: TokenStream): AliasedPropperty {
    let path = "";
    let lastWasText = false;

    const variable = parseVariable(stream);
    if (variable) {
        const result = { field: variable, alias: variable };
        logger.debug("File is a variable", result);
        return result;
    }

    while (!stream.done()) {
        const fileToken = stream.get();
        if (fileToken.is(Type.dot) || fileToken.is(Type.special, '/')) {
            path += fileToken.value;
            lastWasText = false;
        } else if (fileToken.is(Type.word)) {
            if (lastWasText) {
                const result = { field: path, alias: null };
                logger.debug("File is a path", result);
                return result;
            } else {
                path += fileToken.value;
                lastWasText = true;
            }
        } else if (fileToken.is(Type.semicolon)) {
            const result = { field: path, alias: null };
            logger.debug("File is a path", result);
            return result;
        } else if (fileToken.is(Type.number)) {
            path += fileToken.value;
        } else if (fileToken.is(Type.special, "@")) {
            if (path.length > 0) {
                stream.unexpectedToken();
            }
            const variable = parseVariable(stream);
            if (!variable) {
                stream.unexpectedToken();
            }
            const result = { field: variable, alias: variable };
            logger.debug("File is a variable", result);
            return result;
        } else {
            stream.unexpectedToken();
        }

        stream.advance();
    }

    const result = { field: path, alias: null };
    logger.debug("File is a path", result);
    return result;
}