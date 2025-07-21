import { AliasedPropperty, JoinMap } from "./ast";
import { fileUtils } from "./utils/file";
import { FilterFunction } from "./filterFunction";

export interface SourceData {
  source: string;
  where?: FilterFunction;
  data: object[];
}

export async function sourceData(main: AliasedPropperty, joins: JoinMap, variables: Record<string, object[]>): Promise<SourceData[]> {
  async function loadData(file: string): Promise<object[]> {
    if (file.startsWith("@")) {
      return variables[file];
    }

    const data = await fileUtils.readJson(file);
    return Array.isArray(data) ? data : [data as object];
  }

  // Check for duplicate aliases
  const aliases = new Set([main.alias]);
  for (const [_, { alias }] of Object.entries(joins)) {
    if (aliases.has(alias)) {
      throw new Error(`Duplicate alias: ${alias}`);
    }
    aliases.add(alias);
  }

  // Get unique files to load
  const uniqueFiles = new Set([main.field]);
  for (const [joinFile] of Object.entries(joins)) {
    uniqueFiles.add(joinFile);
  }

  // Load all unique files in parallel
  const fileLoads = Array.from(uniqueFiles).map(async file => ({
    file,
    data: await loadData(file)
  }));
  const loadedData = await Promise.all(fileLoads);
  const fileDataMap = new Map(loadedData.map(({ file, data }) => [file, data]));

  // Build result array in order
  const result: SourceData[] = [{
    source: main.alias || main.field,
    data: fileDataMap.get(main.field)!
  }];

  for (const [joinFile, joinConfig] of Object.entries(joins)) {
    result.push({
      source: joinConfig.alias || joinFile,
      where: joinConfig.where,
      data: fileDataMap.get(joinFile)!
    });
  }

  return result;
}
