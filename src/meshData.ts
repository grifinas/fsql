import { SourceData } from "./sourceData";

export type MeshedRow = Record<string, object>;

export function meshData(sources: SourceData[]): MeshedRow[] {
  if (sources.length === 0) {
    return [];
  }

  const results: MeshedRow[] = [];

  for (const source of sources) {
    if (results.length === 0) {
      results.push(...source.data.map(dataRow => ({ [source.source]: dataRow })));
      continue;
    }
    for (const joinRow of source.data) {
      const pendingRows: MeshedRow[] = [];
      for (const row of results) {
        const pendingRow = { ...row, [source.source]: joinRow };
        if (source.where && !source.where.resolve(pendingRow)) {
          continue;
        }
        pendingRows.push(pendingRow);
      }
      results.push(...pendingRows);
    }
  }

  return results;
}