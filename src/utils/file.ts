import * as fs from 'node:fs/promises';

async function readJson(path: string): Promise<object> {
  const content = await fs.readFile(path);
  return JSON.parse(content.toString());
}

export const fileUtils = {
    readJson
}
