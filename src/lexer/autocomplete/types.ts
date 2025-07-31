import { CompleterResult } from "readline";
import { LexerState } from "./simpleLexerState";

export type AutocompleteFunction = (
  words: string[],
  state: LexerState,
) => Promise<CompleterResult> | CompleterResult;
