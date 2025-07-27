import { TokenStream } from "@tokenizer";
import { parseVariable } from "./parseVariable";
import { logger } from "@utils";
import { withVarAlias } from './parseAlias';
import { ANY, Symbols } from "./constants";
import { DataSource, VariableDataSource, FileDataSource } from "@entities";

export function parseDataSource(stream: TokenStream): DataSource {
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
        const fileToken = stream.get(ANY.DOT, Symbols.SLASH, ANY.WORD, ANY.SEMICOLON, ANY.NUMBER);
        if (fileToken.is(ANY.DOT) || fileToken.is(Symbols.SLASH)) {
            path += fileToken.value;
            lastWasText = false;
        } else if (fileToken.is(ANY.WORD)) {
            if (lastWasText) {
                return new FileDataSource(path);
            } else {
                path += fileToken.value;
                lastWasText = true;
            }
        } else if (fileToken.is(ANY.SEMICOLON)) {
            return new FileDataSource(path);
        } else if (fileToken.is(ANY.NUMBER)) {
            path += fileToken.value;
        }

        //TODO feels off, sometimes we do not consume the final token maybe?
        stream.advance();
    }

    return new FileDataSource(path);
}