import { AST, JoinMap } from "./ast";
import { DataSource, FileDataSource } from "../entities";
import { FilterFunction } from "../entities";
import { fileUtils } from "../utils";

export interface SourceData {
  source: string;
  where?: FilterFunction;
  data: object[];
}

export async function source(tree: AST): Promise<SourceData[]> {
  if (!tree.mainfile) {
    throw new Error("No main file specified");
  }
  const main: DataSource = tree.mainfile;
  const joins: JoinMap = tree.joinFiles;
  const variables: Record<string, object[]> = tree.variables;

  const refMap = new Map<string, Promise<object[]>>();
  const fileMap = new Map<string, Promise<object[]>>();
  const sources = [main, ...Object.values(joins).map(j => j.source)];
  const aliases = new Set();

  for (const source of sources) {
    if (source instanceof FileDataSource) {
      const filePromise = fileMap.get(source.filePath);

      if (source.getAlias()) {
        if (aliases.has(source.getAlias())) throw new Error(`Duplicate alias: ${source.getAlias()}`);
        aliases.add(source.getAlias());
      }

      if (filePromise) {
        refMap.set(source.ref(), filePromise);
      } else {
        const promise = loadData(source.filePath);
        fileMap.set(source.filePath, promise);
        refMap.set(source.ref(), promise);
      }
    } else {
      refMap.set(source.ref(), Promise.resolve(variables[source.ref()]));
    }
  }

  const result: SourceData[] = [{
    source: main.ref(),
    data: await refMap.get(main.ref())!
  }];

  for (const [joinFile, joinConfig] of Object.entries(joins)) {
    result.push({
      source: joinConfig.source.ref(),
      where: joinConfig.where,
      data: await refMap.get(joinFile)!
    });
  }

  return result;

}

async function loadData(file: string): Promise<object[]> {
  const data = await fileUtils.readJson(file);
  return Array.isArray(data) ? data : [data as object];
}