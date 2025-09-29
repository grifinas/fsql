# FSQL Plugin System

The FSQL tool supports a flexible plugin system that allows you to extend file format support without modifying the core codebase. Plugins can be loaded dynamically at runtime and distributed as separate npm packages.

## Overview

The plugin system allows you to:
- Add support for custom file formats (e.g., `.foobar`, `.custom`, etc.)
- Load plugins dynamically from npm packages or local files
- Configure plugins via JSON configuration files
- Override built-in plugins if needed
- Use multiple plugin configuration sources

## Built-in Plugins

FSQL comes with these built-in plugins:

### JSON Plugin
- **Extensions**: `.json`, `.jsonl`
- **Description**: Handles standard JSON files and JSON Lines format
- **Usage**: Automatically used for files with `.json` or `.jsonl` extensions

### CSV Plugin
- **Extensions**: `.csv`, `.tsv`
- **Description**: Handles comma-separated and tab-separated value files with automatic type inference
- **Usage**: Automatically used for files with `.csv` or `.tsv` extensions

## Plugin Configuration Loading

FSQL loads plugin configurations from multiple sources in this order:

1. **Default location**: `plugins.json` next to the CLI binary (always loaded if exists)
2. **Environment variable**: `FSQL_PLUGINS_JSON` environment variable path (loaded additionally)
3. **Explicit parameter**: Programmatically specified config path (loaded additionally)

All configuration files are loaded additively - they don't override each other.

### Environment Variable Usage

```bash
# Set globally for all FSQL commands
export FSQL_PLUGINS_JSON=/home/user/.config/fsql/my-plugins.json

# Or use for a single command
FSQL_PLUGINS_JSON=/path/to/plugins.json fsql "SELECT * FROM data.foobar"
```

## Creating Custom Plugins

### Plugin Interface

All plugins must implement the `FileReaderPlugin` interface available in the main package:

```typescript
import { FileReaderPlugin } from "fsql";

interface FileReaderPlugin {
  readonly name: string;
  readonly extensions: string[];
  readFile(filePath: string): Promise<object[]>;
  canHandle?(filePath: string): Promise<boolean>; // Optional
}
```

### Example Plugin (JavaScript)

```javascript
// my-custom-plugin.js
const fs = require('fs').promises;

class CustomFormatPlugin {
  constructor() {
    this.name = "custom-format";
    this.extensions = ["foobar", "custom"];
  }

  async readFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Example: Simple key-value parser
    const lines = content.trim().split('\n');
    const result = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim();
          try {
            result[key.trim()] = JSON.parse(value);
          } catch {
            result[key.trim()] = value;
          }
        }
      }
    }
    
    // Always return an array of objects
    return [result];
  }

  async canHandle(filePath) {
    return filePath.toLowerCase().endsWith('.foobar');
  }
}

// Export the plugin (multiple patterns supported)
module.exports = CustomFormatPlugin;
```

### Example Plugin (TypeScript)

```typescript
// my-plugin.ts
import * as fs from "node:fs/promises";
import { FileReaderPlugin } from "fsql";

export class XmlReaderPlugin implements FileReaderPlugin {
  readonly name = "xml";
  readonly extensions = ["xml"];

  async readFile(filePath: string): Promise<object[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Use xml2js or similar library
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(content);
    
    // Transform XML structure to array of objects
    return this.transformXmlToObjects(result);
  }

  private transformXmlToObjects(xmlData: any): object[] {
    // Your XML transformation logic here
    return Array.isArray(xmlData) ? xmlData : [xmlData];
  }

  async canHandle(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.trim().startsWith('<?xml') || content.includes('<');
    } catch {
      return false;
    }
  }
}

export default XmlReaderPlugin;
```

## Plugin Configuration

### Configuration File Format

```json
[
  {
    "name": "xml-reader",
    "module": "@my-org/fsql-xml-plugin",
    "enabled": true,
    "options": {
      "override": false
    }
  },
  {
    "name": "yaml-reader",
    "module": "./local-plugins/yaml-plugin.js",
    "enabled": true
  },
  {
    "name": "excel-reader",
    "module": "fsql-excel-plugin",
    "enabled": false
  }
]
```

### Configuration Options

- **name**: Descriptive name for the plugin
- **module**: Path to the plugin module (npm package name or local file path)
- **enabled**: Whether the plugin should be loaded (default: true)
- **options**: Plugin registration options
  - **override**: Whether to override existing plugins for the same extensions (default: false)

## Plugin Loading Examples

### Automatic Loading

```bash
# Default plugins.json next to CLI binary is always loaded
fsql "SELECT * FROM data.json"

# Additional plugins from environment variable
FSQL_PLUGINS_JSON=/home/user/.fsql/plugins.json fsql "SELECT * FROM data.foobar"
```

### Programmatic Loading

```typescript
import { pluginLoader, pluginRegistry } from "fsql";

// Load a single plugin
await pluginLoader.loadPlugin("./my-plugin.js");

// Load plugins from configuration
await pluginLoader.loadPluginsFromConfig("./plugins.json");

// Load plugins from directory
await pluginLoader.loadPluginsFromDirectory("./plugins/", "*.plugin.js");

// Register a plugin instance directly
pluginRegistry.register(new MyCustomPlugin());
```

## Distribution

### As npm Package

1. **Package structure**:
```json
{
  "name": "fsql-yaml-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "fsql": "^0.2.0"
  },
  "dependencies": {
    "js-yaml": "^4.1.0"
  }
}
```

2. **Plugin implementation**:
```typescript
import { FileReaderPlugin } from "fsql";
import * as yaml from "js-yaml";

export class YamlPlugin implements FileReaderPlugin {
  readonly name = "yaml";
  readonly extensions = ["yaml", "yml"];

  async readFile(filePath: string): Promise<object[]> {
    // Implementation here
  }
}

export default YamlPlugin;
```

3. **User installation**:
```bash
npm install fsql-yaml-plugin
```

4. **User configuration**:
```json
[
  {
    "name": "yaml",
    "module": "fsql-yaml-plugin",
    "enabled": true
  }
]
```

### As Local File

Place your plugin file anywhere and reference it:

```json
[
  {
    "name": "local-plugin",
    "module": "./plugins/my-plugin.js",
    "enabled": true
  }
]
```

## Usage Examples

### Basic Usage

```bash
# Use custom format after plugin is configured
fsql "SELECT * FROM data.foobar WHERE age > 25"

# With environment variable
FSQL_PLUGINS_JSON=/path/to/plugins.json fsql "SELECT name FROM users.xml"
```

### Advanced Queries

```sql
-- Query YAML configuration files
SELECT service.name, service.port FROM config.yaml WHERE service.enabled = true

-- Join different formats
SELECT u.name, p.title 
FROM users.json u 
JOIN posts.xml p ON u.id = p.author_id

-- Use custom format with aggregation
SELECT category, COUNT(*) as count 
FROM products.foobar 
GROUP BY category
```

## TypeScript Support

The plugin system provides full TypeScript support:

```typescript
import { 
  FileReaderPlugin, 
  PluginRegistrationOptions,
  pluginRegistry,
  pluginLoader 
} from "fsql";

// Type-safe plugin development
class MyPlugin implements FileReaderPlugin {
  readonly name = "my-plugin";
  readonly extensions = ["myext"];
  
  async readFile(filePath: string): Promise<object[]> {
    // Implementation with full type safety
  }
}

// Type-safe plugin registration
const options: PluginRegistrationOptions = {
  override: true
};

pluginRegistry.register(new MyPlugin(), options);
```

## Best Practices

1. **Error Handling**: Always handle parsing errors gracefully and provide meaningful error messages
2. **Type Safety**: Use TypeScript for better development experience and type checking
3. **Testing**: Test your plugin with various file formats, edge cases, and malformed input
4. **Documentation**: Document your plugin's expected file format and any special requirements
5. **Validation**: Validate input data before processing and return consistent object structures
6. **Performance**: Consider memory usage for large files and implement streaming if needed
7. **Dependencies**: Keep external dependencies minimal and well-maintained
8. **Naming**: Use descriptive plugin names and follow consistent naming conventions

## Troubleshooting

### Plugin Not Loading

1. **Check file paths**: Ensure the module path in configuration is correct
2. **Verify exports**: Ensure the plugin exports the correct interface
3. **Check configuration**: Verify the plugin is enabled in configuration
4. **Review logs**: Check console logs for detailed error messages
5. **Test isolation**: Try loading the plugin programmatically to isolate issues

### Type Errors

1. **Import paths**: Ensure you're importing types from the correct package
2. **Interface compliance**: Check that your plugin implements all required methods
3. **TypeScript config**: Verify your TypeScript configuration is compatible

### Runtime Errors

1. **Return format**: Ensure `readFile` always returns an array of objects
2. **Async handling**: Ensure all async methods are properly awaited
3. **Path validation**: Validate file paths and content before parsing
4. **Error propagation**: Let meaningful errors bubble up to help with debugging

### Environment Variable Issues

```bash
# Debug plugin loading
FSQL_PLUGINS_JSON=/path/to/plugins.json fsql --logLevel 5 "SELECT 1"

# Check if environment variable is set
echo $FSQL_PLUGINS_JSON

# Verify file exists and is readable
ls -la $FSQL_PLUGINS_JSON
```

## Complete Example: TOML Plugin

Here's a complete, production-ready plugin example:

```typescript
// toml-plugin.ts
import * as fs from "node:fs/promises";
import * as toml from "@iarna/toml";
import { FileReaderPlugin } from "fsql";

export class TomlReaderPlugin implements FileReaderPlugin {
  readonly name = "toml";
  readonly extensions = ["toml"];

  async readFile(filePath: string): Promise<object[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = toml.parse(content);
      
      if (data === null || data === undefined) {
        return [];
      }
      
      // TOML files typically represent single configuration objects
      // Convert to array format expected by FSQL
      return [data as object];
    } catch (error) {
      throw new Error(
        `Failed to parse TOML file ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async canHandle(filePath: string): Promise<boolean> {
    // Basic extension check plus content validation
    if (!filePath.toLowerCase().endsWith('.toml')) {
      return false;
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      // Try to parse a small portion to validate format
      toml.parse(content.slice(0, 1000));
      return true;
    } catch {
      return false;
    }
  }
}

export default TomlReaderPlugin;
```

**Configuration**:
```json
[
  {
    "name": "toml-config",
    "module": "./toml-plugin.js",
    "enabled": true
  }
]
```

**Usage**:
```sql
SELECT database.host, database.port FROM config.toml WHERE database.enabled = true
```
