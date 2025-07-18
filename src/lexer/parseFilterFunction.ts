import { Type } from "../token";
import { TokenStream } from "../tokenStream";
import { FilterFunction } from "../filterFunction";
import { parseProperty } from "./parseProperty";

export function parseFilterFunction(stream: TokenStream): FilterFunction {
  const left = parseProperty(stream);

  const comparatorToken = stream.get();
  if (comparatorToken.is(Type.comp) || comparatorToken.is(Type.equals)) {
    stream.advance();
    const right = parseProperty(stream);
    return new FilterFunction(left, comparatorToken.value, right);
  } else {
    stream.unexpectedToken();
  }
}    
