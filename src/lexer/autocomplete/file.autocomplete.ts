import { KEYWORD } from "@lexer";
import { fileUtils } from "@utils";
import { Token } from "@tokenizer";
import { Type } from "@types";
import { CompleterResult } from "readline";
import { defaultAutocompleteFunction } from "./default.autocomplete";

export async function fileAutocomplete(
  words: string[],
): Promise<CompleterResult> {
  const partialPath = words[words.length - 1];
  const prevWord = words[words.length - 2] || "";

  if (new Token(Type.word, partialPath).isIn([KEYWORD.FROM, KEYWORD.JOIN])) {
    const [matches, str] = await filesAndVars("");
    return [matches, str + " "];
  } else if (
    new Token(Type.word, prevWord).isIn([KEYWORD.FROM, KEYWORD.JOIN])
  ) {
    return filesAndVars(partialPath);
  } else {
    return defaultAutocompleteFunction(words);
  }
}

async function filesAndVars(partialPath: string): Promise<CompleterResult> {
  const currentPath = partialPath.includes("/")
    ? partialPath.substring(0, partialPath.lastIndexOf("/") + 1)
    : "";

  // List files in the current directory path
  const files = await fileUtils.listFiles(currentPath);
  const fileNames = files.map((f) => {
    const name = currentPath + f.name;
    return f.type === "directory" ? name + "/" : name;
  });
  fileNames.push("@0");

  const matches = fileNames.filter((f) => f.startsWith(partialPath));

  return [matches, partialPath];
}
