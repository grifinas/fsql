import { TokenStream } from "@tokenizer";
import { parseVariable } from "./parseVariable";
import { logger } from "@utils";
import { withVarAlias } from "./parseAlias";
import { ANY, SYMBOL } from "./constants";
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
  let expectedPos = 0;
  while (!stream.done()) {
    const fileToken = stream.get(
      ANY.DOT,
      SYMBOL.SLASH,
      ANY.WORD,
      ANY.SEMICOLON,
      ANY.NUMBER,
    );
    //positions don't match, found a space
    if (expectedPos > 0 && expectedPos !== fileToken.position) {
      return new FileDataSource(path);
    } else {
      expectedPos = fileToken.position + fileToken.value.length;
    }

    if (fileToken.is(ANY.DOT) || fileToken.is(SYMBOL.SLASH)) {
      path += fileToken.value;
    } else if (fileToken.is(ANY.WORD)) {
      path += fileToken.value;
    } else if (fileToken.is(ANY.SEMICOLON)) {
      return new FileDataSource(path);
    } else if (fileToken.is(ANY.NUMBER)) {
      path += fileToken.value;
    }

    stream.advance();
  }

  return new FileDataSource(path);
}
