import { TokenStream } from "@tokenizer";
import {
  FieldProperty,
  FunctionProperty,
  IdentityProperty,
  Property,
  ResolvedProperty,
} from "@entities";
import { ANY, RESERVED_WORDS, SYMBOL } from "./constants";
import { logger } from "@utils";

export function parseField(stream: TokenStream): Property {
  const parts: string[] = [];
  let start = stream.getIndex();

  if (stream.advanceIf(SYMBOL.ALL)) {
    //TODO can be more than null
    return new IdentityProperty(null);
  }

  do {
    const token = stream.consume(ANY.NUMBER, ANY.WORD, ANY.STRING);
    if (token.is(ANY.STRING)) {
      return new ResolvedProperty(token.value);
    } else {
      parts.push(token.value);
    }
  } while (stream.advanceIf(ANY.DOT));

  if (stream.advanceIf(SYMBOL.OPEN_PARENTHESIS)) {
    stream.setIndex(start);
    return parseFunction(stream);
  }

  if (parts.length === 1) {
    const [arg] = parts;
    if (["true", "false"].includes(arg.toLocaleLowerCase())) {
      return new ResolvedProperty(arg === "true");
    } else if (!isNaN(Number(arg))) {
      return new ResolvedProperty(Number(arg));
    }
  }

  const fieldName = parts.join(".");
  logger.debug("Field name is", fieldName);
  if (
    RESERVED_WORDS.some(
      (token) =>
        token.value?.toLocaleLowerCase() === fieldName.toLocaleLowerCase(),
    )
  ) {
    stream.unexpectedToken("Any non-reserved word");
  }

  return new FieldProperty(null, fieldName);
}

function parseFunction(stream: TokenStream): FunctionProperty {
  const fnName = stream.consume(ANY.WORD).value;
  stream.consume(SYMBOL.OPEN_PARENTHESIS);

  const token = stream.get();
  const args: Property[] = [];
  if (token.isNot(SYMBOL.CLOSE_PARENTHESIS)) {
    do {
      args.push(parseField(stream));
    } while (stream.advanceIf(ANY.COMMA));
  }

  stream.consume(SYMBOL.CLOSE_PARENTHESIS);

  return new FunctionProperty(fnName, args);
}
