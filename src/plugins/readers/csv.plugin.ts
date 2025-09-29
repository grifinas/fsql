import * as fs from "node:fs/promises";
import { FileReaderPlugin } from "../types";

/**
 * CSV file reader plugin
 * This is an example of how to create custom plugins
 */
export class CsvReaderPlugin implements FileReaderPlugin {
  readonly name = "csv";
  readonly extensions = ["csv", "tsv"];

  async readFile(filePath: string): Promise<object[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const delimiter = filePath.toLowerCase().endsWith('.tsv') ? '\t' : ',';
    
    return this.parseCsv(content, delimiter);
  }

  private parseCsv(content: string, delimiter: string = ','): object[] {
    const lines = content.trim().split('\n');
    if (lines.length === 0) {
      return [];
    }

    // First line is headers
    const headers = this.parseCsvLine(lines[0], delimiter);
    const results: object[] = [];

    // Parse data lines
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i], delimiter);
      const row: Record<string, any> = {};
      
      for (let j = 0; j < headers.length; j++) {
        const value = values[j] || '';
        // Try to parse as number, otherwise keep as string
        row[headers[j]] = this.parseValue(value);
      }
      
      results.push(row);
    }

    return results;
  }

  private parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  }

  private parseValue(value: string): any {
    // Remove surrounding quotes if present
    const trimmed = value.replace(/^"(.*)"$/, '$1');
    
    // Try to parse as number
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return parseFloat(trimmed);
    }
    
    // Try to parse as boolean
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    
    // Return as string
    return trimmed;
  }

  async canHandle(filePath: string): Promise<boolean> {
    // Could add more sophisticated detection here
    // e.g., peek at file content to verify it looks like CSV
    return true;
  }
}
