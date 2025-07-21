import * as fs from 'node:fs/promises';
import * as path from 'node:path';

async function readJson(filepath: string): Promise<object> {
  const filePath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);

  const content = await fs.readFile(filePath);
  return JSON.parse(content.toString());
}

export const fileUtils = {
    readJson
}
