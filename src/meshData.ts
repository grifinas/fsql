import { SourceData } from "./sourceData";

export interface MeshedRow {
  [sourceRef: string]: object;
};

export function meshData(sources: SourceData[]): MeshedRow[] {
  if (sources.length === 0) {
    return [];
  }

  if (sources.length === 1) {
    return somethingRecursive(sources);
  }

  const rows = somethingRecursive(sources);
  return rows.filter(row => {
    for (const source of sources) {
      if (source.where && !source.where.resolve(row)) {
        return false;
      }
    }
    return true;
  });
}


function somethingRecursive(sources: SourceData[], rows: MeshedRow[] = []) {
  const [source, ...rest] = sources;
  const newRows: MeshedRow[] = [];
  if (rows.length) {
    for (const sourceRow of source.data) {
      for (const row of rows) {
        newRows.push({ ...row, [source.source]: sourceRow });
      }
    }
  } else {
    for (const sourceRow of source.data) {
      newRows.push({ [source.source]: sourceRow });
    }
  }

  if (rest.length > 0) {
    return somethingRecursive(rest, newRows);
  }

  return newRows;
}