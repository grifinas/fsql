import { CompleterResult } from "readline";
import { SQLFactory } from "@sqlFunctions";
import { KEYWORD } from "@lexer";

const sqlFunctions = SQLFactory.list();

// Get SQL keywords
const sqlKeywords: string[] = [
  KEYWORD.SELECT.value,
  KEYWORD.FROM.value,
  KEYWORD.JOIN.value,
  KEYWORD.WHERE.value,
  KEYWORD.ORDER.value,
  KEYWORD.GROUP.value,
  KEYWORD.LIMIT.value,
  KEYWORD.OFFSET.value,
  KEYWORD.INTO.value,
].filter((w): w is string => Boolean(w));

export function defaultAutocompleteFunction(words: string[]): CompleterResult {
  const lastWord = words[words.length - 1].toUpperCase();
  const suggestions = [...sqlKeywords, ...sqlFunctions];
  const matches = suggestions.filter((s) => s.startsWith(lastWord));

  return [matches, words[words.length - 1]];
}
