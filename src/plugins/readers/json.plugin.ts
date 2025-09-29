import * as fs from "node:fs/promises";
import { FileReaderPlugin } from "../types";

/**
 * Default JSON file reader plugin
 */
export class JsonReaderPlugin implements FileReaderPlugin {
  readonly name = "json";
  readonly extensions = ["json", "jsonl"];

  async readFile(filePath: string): Promise<object[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    if (filePath.toLowerCase().endsWith('.jsonl')) {
      return this.parseJsonLines(content);
    }
    
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data as object];
  }

  private parseJsonLines(content: string): object[] {
    const lines = content.trim().split('\n');
    const results: object[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        try {
          const parsed = JSON.parse(trimmedLine);
          results.push(parsed);
        } catch (error) {
          throw new Error(`Invalid JSON line: ${trimmedLine}`);
        }
      }
    }
    
    return results;
  }

  async canHandle(filePath: string): Promise<boolean> {
    return true;
  }
}
