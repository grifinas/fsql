import { CompleterResult } from "readline";
import { defaultAutocompleteFunction } from "./default.autocomplete";

export function selectAutocompleteFunction(words: string[]): CompleterResult {
  const lastWord = words[words.length - 1];
  const prevWord = words[words.length - 2] || "";

  if (prevWord === "*" && lastWord === "") return [["FROM "], lastWord];

  return defaultAutocompleteFunction(words);
}
