import * as path from "node:path";
import * as fs from "node:fs/promises";
import { pluginRegistry } from "./registry";
import { logger } from "@utils";
import {
  FileReaderPlugin,
  PluginRegistrationOptions,
  PluginModule,
} from "./types";
import z from "zod";

const Config = z.array(
  z.object({
    name: z.string(),
    module: z.string(),
    enabled: z.boolean().default(true),
    options: z.record(z.string(), z.any()).optional(),
  }),
);
type Config = z.infer<typeof Config>;

export class PluginLoader {
  async loadPlugin(
    modulePath: string,
    options: PluginRegistrationOptions = {},
  ): Promise<FileReaderPlugin> {
    try {
      logger.log(`Loading plugin from: ${modulePath}`);

      // Dynamic import of the plugin module
      const pluginModule: PluginModule = await import(modulePath);

      logger.debug(`Plugin module loaded:`, {
        pluginModule,
        modulePath,
        options,
      });

      // Extract the plugin instance
      let plugin: FileReaderPlugin;

      // Look for any exported class that implements FileReaderPlugin
      const exports = Object.values(pluginModule);
      const pluginClass = exports.find(
        (exp) =>
          exp &&
          typeof exp === "function" &&
          exp.prototype &&
          "readFile" in exp.prototype,
      );

      if (pluginClass) {
        plugin = new (pluginClass as any)();
      } else {
        throw new Error(`No valid plugin found in module: ${modulePath}`);
      }

      // Validate plugin interface
      this.validatePlugin(plugin);

      // Register the plugin
      pluginRegistry.register(plugin, options);

      logger.log(`Successfully loaded and registered plugin: ${plugin.name}`);
      return plugin;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to load plugin from ${modulePath}: ${errorMessage}`);
      throw new Error(
        `Failed to load plugin from ${modulePath}: ${errorMessage}`,
      );
    }
  }

  async loadPluginsFromConfig(configPath: string): Promise<FileReaderPlugin[]> {
    try {
      const configContent = await fs.readFile(configPath, "utf-8");
      const parseResult = Config.safeParse(JSON.parse(configContent));

      if (!parseResult.success) {
        throw new Error(
          `Invalid plugin configuration in ${configPath}: ${z.treeifyError(parseResult.error)}`,
        );
      }

      const loadedPlugins: FileReaderPlugin[] = [];

      for (const pluginConfig of parseResult.data) {
        if (pluginConfig.enabled === false) {
          logger.log(`Skipping disabled plugin: ${pluginConfig.name}`);
          continue;
        }

        const absolutePath = path.isAbsolute(pluginConfig.module)
          ? pluginConfig.module
          : path.join(path.dirname(configPath), pluginConfig.module);

        try {
          const plugin = await this.loadPlugin(
            absolutePath,
            pluginConfig.options,
          );
          loadedPlugins.push(plugin);
        } catch (error) {
          logger.error(
            `Failed to load plugin: "${pluginConfig.name}". Error: ${error}`,
          );
          // Continue loading other plugins even if one fails
        }
      }

      return loadedPlugins;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to load plugins from config ${configPath}: ${errorMessage}`,
      );
    }
  }

  private validatePlugin(plugin: any): asserts plugin is FileReaderPlugin {
    if (!plugin || typeof plugin !== "object") {
      throw new Error("Plugin must be an object");
    }

    if (typeof plugin.name !== "string") {
      throw new Error("Plugin must have a name property of type string");
    }

    if (!Array.isArray(plugin.extensions)) {
      throw new Error(
        "Plugin must have an extensions property of type string[]",
      );
    }

    if (typeof plugin.readFile !== "function") {
      throw new Error("Plugin must have a readFile method");
    }

    if (plugin.canHandle && typeof plugin.canHandle !== "function") {
      throw new Error(
        "Plugin canHandle property must be a function if provided",
      );
    }
  }
}
