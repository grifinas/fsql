import { TokenStream } from "../tokenStream";
import { Type } from "../token";
import { parseVariable } from "./parseVariable";
import { logger } from "../utils/logger";
import { DataSource, FileDataSource, VariableDataSource } from "../dataSource";
import { withVarAlias } from './parseAlias';

export function parseFile(stream: TokenStream): DataSource {
    const variable = parseVariable(stream);
    if (variable) {
        logger.debug("File is a variable", variable);
        return new VariableDataSource(variable);
    }

    const file = withVarAlias(parseFileDataSource, stream);
    logger.debug("File is a path", file);
    return file;
}

function parseFileDataSource(stream: TokenStream) {
    let path = "";
    let lastWasText = false;
    while (!stream.done()) {
        const fileToken = stream.get();
        if (fileToken.is(Type.dot) || fileToken.is(Type.special, '/')) {
            path += fileToken.value;
            lastWasText = false;
        } else if (fileToken.is(Type.word)) {
            if (lastWasText) {
                return new FileDataSource(path);
            } else {
                path += fileToken.value;
                lastWasText = true;
            }
        } else if (fileToken.is(Type.semicolon)) {
            return new FileDataSource(path);
        } else if (fileToken.is(Type.number)) {
            path += fileToken.value;
        } else {
            stream.unexpectedToken();
        }

        stream.advance();
    }

    return new FileDataSource(path);
}