import { Type } from "../token";
import { TokenStream } from "../tokenStream";
import { FilterFunction } from "../filterFunction";
import { parseProperty } from "./parseProperty";

export function parseFilterFunction(stream: TokenStream): FilterFunction {
    const left = parseProperty(stream);
    // console.log("Parsed left", left, stream.toStringFromCurrent());
  
    const comparatorToken = stream.get();
    if (comparatorToken.is(Type.comp) || comparatorToken.is(Type.equals)) {
      stream.advance();
      const right = parseProperty(stream);
      // console.log("Parsed right", right, stream.toStringFromCurrent());
      return new FilterFunction(left, comparatorToken.value, right);
    } else {
      stream.unexpectedToken();
    }
}    
