import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export class FileUtils {
  async readJson(filepath: string): Promise<object> {
    const filePath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);

    const content = await fs.readFile(filePath);
    return JSON.parse(content.toString());
  }

  async readSql(filepath: string): Promise<string> {
    const filePath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);

    const content = await fs.readFile(filePath);
    return content.toString();
  }

  async writeJson(filepath: string, data: object): Promise<void> {
    const filePath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async writeString(filepath: string, data: string): Promise<void> {
    const filePath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    await fs.writeFile(filePath, data);
  }
}

export const fileUtils = new FileUtils();
