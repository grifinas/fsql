import * as fs from "node:fs/promises";
import * as path from "node:path";
import { logger } from '@utils';

export class FileUtils {
  async readJson(filepath: string): Promise<object> {
    const filePath = path.isAbsolute(filepath)
      ? filepath
      : path.join(process.cwd(), filepath);

    const content = await fs.readFile(filePath);
    return JSON.parse(content.toString());
  }

  async readSql(filepath: string): Promise<string> {
    const filePath = path.isAbsolute(filepath)
      ? filepath
      : path.join(process.cwd(), filepath);

    logger.log("Reading sql", filePath);

    const content = await fs.readFile(filePath);
    return content.toString();
  }

  async writeJson(filepath: string, data: object): Promise<void> {
    const filePath = path.isAbsolute(filepath)
      ? filepath
      : path.join(process.cwd(), filepath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async listFiles(
    dirPath: string = "",
    withStat: boolean = false,
  ): Promise<
    Array<{ name: string; type: "file" | "directory"; size?: number }>
  > {
    const directory = path.isAbsolute(dirPath)
      ? dirPath
      : path.join(process.cwd(), dirPath);

    const entries = await fs.readdir(directory, { withFileTypes: true });
    return await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          return { name: entry.name, type: "directory" as const };
        } else if (withStat) {
          const stat = await fs.stat(fullPath);
          return { name: entry.name, type: "file" as const, size: stat.size };
        } else {
          return { name: entry.name, type: "file" as const };
        }
      }),
    );
  }
}

export const fileUtils = new FileUtils();
