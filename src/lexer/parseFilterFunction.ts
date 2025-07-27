import { TokenStream } from "@tokenizer";
import { FilterFunction, Operator } from "@entities";
import { parseProperty } from "./parseProperty";
import { ANY, RESERVED_WORDS } from "./constants";
import { ResolvedProperty } from "@entities";

export function parseFilterFunction(stream: TokenStream): FilterFunction {
  const left = parseProperty(stream);

  if (stream.done()) {
    return new FilterFunction(left, "=", new ResolvedProperty(true));
  }

  const token = stream.get();

  if (token.isIn([ANY.COMP, ANY.EQUALS])) {
    stream.advance();
    const right = parseProperty(stream);
    return new FilterFunction(left, token.value as Operator, right);
  } else if (RESERVED_WORDS.some((token) => token.value === token.value)) {
    return new FilterFunction(left, "=", new ResolvedProperty(true));
  } else {
    stream.unexpectedToken("Comparison or reserved word");
  }
}
