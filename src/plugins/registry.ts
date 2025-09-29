import * as path from "node:path";
import * as fs from "node:fs/promises";
import { FileReaderPlugin, PluginRegistrationOptions } from "./types";
import { logger } from "@utils";
import { PluginLoader } from "./loader";
import { currentDir } from "@dir";

export class PluginRegistry {
  private plugins = new Map<string, FileReaderPlugin>();
  private extensionMap = new Map<string, FileReaderPlugin>();
  private loader: PluginLoader;

  constructor() {
    this.loader = new PluginLoader();
  }

  register(
    plugin: FileReaderPlugin,
    options: PluginRegistrationOptions = {},
  ): void {
    if (this.plugins.has(plugin.name) && !options.override) {
      throw new Error(
        `Plugin with name '${plugin.name}' is already registered`,
      );
    }

    this.plugins.set(plugin.name, plugin);

    for (const ext of plugin.extensions) {
      const normalizedExt = ext.toLowerCase();

      if (this.extensionMap.has(normalizedExt) && !options.override) {
        throw new Error(
          `Extension '${ext}' is already handled by plugin '${this.extensionMap.get(normalizedExt)?.name}'`,
        );
      }

      this.extensionMap.set(normalizedExt, plugin);
    }
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return;
    }

    this.plugins.delete(pluginName);

    for (const ext of plugin.extensions) {
      const normalizedExt = ext.toLowerCase();
      if (this.extensionMap.get(normalizedExt) === plugin) {
        this.extensionMap.delete(normalizedExt);
      }
    }
  }

  async getPluginForFile(filePath: string): Promise<FileReaderPlugin> {
    const ext = path.extname(filePath).slice(1).toLowerCase();

    const plugin = this.extensionMap.get(ext);
    if (plugin) {
      if (plugin.canHandle) {
        const canHandle = await plugin.canHandle(filePath);
        if (canHandle) {
          return plugin;
        }
      } else {
        return plugin;
      }
    }

    for (const registeredPlugin of this.plugins.values()) {
      if (registeredPlugin.canHandle) {
        const canHandle = await registeredPlugin.canHandle(filePath);
        if (canHandle) {
          return registeredPlugin;
        }
      }
    }

    throw new Error(`No plugin found to handle file: ${filePath}`);
  }

  getAllPlugins(): FileReaderPlugin[] {
    return Array.from(this.plugins.values());
  }

  getPlugin(name: string): FileReaderPlugin | undefined {
    return this.plugins.get(name);
  }

  isExtensionSupported(extension: string): boolean {
    const normalizedExt = extension.startsWith(".")
      ? extension.slice(1).toLowerCase()
      : extension.toLowerCase();
    return this.extensionMap.has(normalizedExt);
  }

  getSupportedExtensions(): string[] {
    return Array.from(this.extensionMap.keys());
  }

  async loadExternalPlugins(configPath?: string): Promise<void> {
    const defaultConfigPath = path.join(currentDir, "plugins.json");
    const configPaths: string[] = [];

    configPaths.push(defaultConfigPath);
    if (process.env.FSQL_PLUGINS_JSON) {
      configPaths.push(process.env.FSQL_PLUGINS_JSON);
    }

    if (configPath) {
      configPaths.push(configPath);
    }

    logger.log(`Loading plugins from multiple sources`, {
      configPaths,
      defaultPath: defaultConfigPath,
      envPath: process.env.FSQL_PLUGINS_JSON,
      explicitPath: configPath,
      cwd: process.cwd(),
    });

    for (const path of configPaths) {
      try {
        await fs.access(path);
        logger.debug(`Loading plugins from: ${path}`);
        await this.loader.loadPluginsFromConfig(path);
      } catch (error) {
        logger.error(
          `Could not load plugins from ${path}: ${error instanceof Error ? error.message : error}`,
        );
        continue;
      }
    }
  }
}

// Global plugin registry instance
export const pluginRegistry = new PluginRegistry();
