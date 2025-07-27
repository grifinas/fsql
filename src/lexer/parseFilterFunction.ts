import { TokenStream } from "../tokenStream";
import { FilterFunction, Operator } from "../filterFunction";
import { parseProperty } from "./parseProperty";
import { ANY } from "./constants";

export function parseFilterFunction(stream: TokenStream): FilterFunction {
  const left = parseProperty(stream);

  const comparatorToken = stream.get();
  if (comparatorToken.isIn([ANY.COMP, ANY.EQUALS])) {
    stream.advance();
    const right = parseProperty(stream);
    return new FilterFunction(left, comparatorToken.value as Operator, right);
  } else {
    stream.unexpectedToken([ANY.COMP, ANY.EQUALS]);
  }
}    
