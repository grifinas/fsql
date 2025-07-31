import { tokenize } from "@tokenizer";
import { CompleterResult } from "readline";
import { AutocompleteFunction } from "./types";
import { defaultAutocompleteFunction } from "./default.autocomplete";
import { fileAutocomplete } from "./file.autocomplete";
import { selectAutocompleteFunction } from "./select.autocomplete";
import { LexerState, simpleLexerState } from "./simpleLexerState";

const stateMap: Record<LexerState, CompleterResult | AutocompleteFunction> = {
  [LexerState.Start]: [["SELECT "], ""],
  [LexerState.SelectStart]: [["* "], ""],
  [LexerState.Select]: selectAutocompleteFunction,
  [LexerState.From]: fileAutocomplete,
  [LexerState.Join]: fileAutocomplete,
  [LexerState.Where]: defaultAutocompleteFunction,
  [LexerState.Order]: defaultAutocompleteFunction,
  [LexerState.Group]: defaultAutocompleteFunction,
  [LexerState.Limit]: defaultAutocompleteFunction,
  [LexerState.Offset]: defaultAutocompleteFunction,
  [LexerState.Into]: fileAutocomplete,
  [LexerState.Unknown]: defaultAutocompleteFunction,
} as const;

export async function autocomplete(line: string): Promise<CompleterResult> {
  const state = simpleLexerState(tokenize(line));
  const completion = stateMap[state];
  if (typeof completion === "function") {
    const words = line.split(/\s+/);
    return completion(words, state);
  } else {
    return completion;
  }
}
