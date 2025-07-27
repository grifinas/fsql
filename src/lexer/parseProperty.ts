import { TokenStream } from "@tokenizer";
import { FieldProperty, Property, ResolvedProperty } from "@entities";
import { parseField } from "./parseField";
import { parseVariable } from "./parseVariable";
import { ANY } from "./constants";

export function parseProperty(stream: TokenStream): Property {
  const varName = parseVariable(stream);
  if (varName) {
    stream.consume(ANY.DOT);
    const field = parseField(stream);
    if (field instanceof FieldProperty) {
      field.source = varName;
      return field;
    } else {
      return new ResolvedProperty(varName);
    }
  }

  return parseField(stream);
}
