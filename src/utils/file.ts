import * as fs from "node:fs/promises";
import * as path from "node:path";
import { logger } from "@utils";
import { pluginRegistry } from "@plugins";

export class FileUtils {
  /**
   * Read and parse a file using the plugin system
   * @param filepath - Path to the file
   * @returns Promise resolving to array of objects
   */
  async readData(filepath: string): Promise<object[]> {
    const filePath = _(filepath);

    const plugin = await pluginRegistry.getPluginForFile(filePath);

    logger.debug(`Using plugin '${plugin.name}' to read file`);
    return await plugin.readFile(filePath);
  }

  /**
   * @deprecated Use readData instead for plugin-based file reading
   */
  async readJson(filepath: string): Promise<object> {
    const filePath = _(filepath);

    const content = await fs.readFile(filePath);
    return JSON.parse(content.toString());
  }

  async readSql(filepath: string): Promise<string> {
    const filePath = _(filepath);

    const content = await fs.readFile(filePath);
    return content.toString();
  }

  async writeJson(filepath: string, data: object): Promise<void> {
    const filePath = _(filepath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async listFiles(
    dirPath: string = "",
    withStat: boolean = false,
  ): Promise<
    Array<{ name: string; type: "file" | "directory"; size?: number }>
  > {
    const directory = _(dirPath);

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

function _(filepath: string): string {
  return path.isAbsolute(filepath)
    ? filepath
    : path.join(process.cwd(), filepath);
}

export const fileUtils = new FileUtils();
