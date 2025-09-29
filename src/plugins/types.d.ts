/**
 * FSQL Plugin System Types
 *
 * This file contains all the essential types needed to create custom file reader plugins for FSQL.
 * Import these types when creating your own plugins.
 */

/**
 * Interface for file reader plugins
 */
export interface FileReaderPlugin {
  /**
   * Unique identifier for the plugin
   */
  readonly name: string;

  /**
   * File extensions this plugin can handle (without the dot)
   * e.g., ['json', 'jsonl'] or ['foobar']
   */
  readonly extensions: string[];

  /**
   * Read and parse a file, returning an array of objects
   * @param filePath - Absolute path to the file
   * @returns Promise resolving to array of objects
   */
  readFile(filePath: string): Promise<object[]>;

  /**
   * Optional: Check if this plugin can handle a specific file
   * Useful for more complex detection beyond just file extension
   * @param filePath - Absolute path to the file
   * @returns Promise resolving to boolean
   */
  canHandle?(filePath: string): Promise<boolean>;
}

/**
 * Plugin registration options
 */
export interface PluginRegistrationOptions {
  /**
   * Whether this plugin should override existing plugins for the same extensions
   */
  override?: boolean;
}

/**
 * Plugin module interface for dynamic loading
 */
export interface PluginModule {
  default?: FileReaderPlugin | (() => FileReaderPlugin);
  plugin?: FileReaderPlugin | (() => FileReaderPlugin);
  [key: string]: any;
}

/**
 * Plugin configuration for loading
 */
export interface PluginConfig {
  /** Name of the plugin */
  name: string;
  /** Path to the plugin module (can be npm package or local file) */
  module: string;
  /** Registration options */
  options?: PluginRegistrationOptions;
  /** Whether the plugin is enabled */
  enabled?: boolean;
}

/**
 * Plugin registry interface
 */
export interface IPluginRegistry {
  /**
   * Register a new plugin
   */
  register(plugin: FileReaderPlugin, options?: PluginRegistrationOptions): void;

  /**
   * Unregister a plugin by name
   */
  unregister(pluginName: string): void;

  /**
   * Get a plugin that can handle the given file
   */
  getPluginForFile(filePath: string): Promise<FileReaderPlugin | null>;

  /**
   * Get all registered plugins
   */
  getAllPlugins(): FileReaderPlugin[];

  /**
   * Get plugin by name
   */
  getPlugin(name: string): FileReaderPlugin | undefined;

  /**
   * Check if an extension is supported
   */
  isExtensionSupported(extension: string): boolean;

  /**
   * Get all supported extensions
   */
  getSupportedExtensions(): string[];
}

/**
 * Plugin loader interface
 */
export interface IPluginLoader {
  /**
   * Load a plugin from a module path
   */
  loadPlugin(
    modulePath: string,
    options?: PluginRegistrationOptions,
  ): Promise<FileReaderPlugin>;

  /**
   * Load plugins from a configuration file
   */
  loadPluginsFromConfig(configPath: string): Promise<FileReaderPlugin[]>;
}

/**
 * Global plugin registry instance
 */
export declare const pluginRegistry: IPluginRegistry;

/**
 * Global plugin loader instance
 */
export declare const pluginLoader: IPluginLoader;

/**
 * Initialize default plugins (JSON, CSV)
 */
export declare function initializeDefaultPlugins(): Promise<void>;

/**
 * Get information about all registered plugins
 */
export declare function getPluginInfo(): Array<{
  name: string;
  extensions: string[];
}>;

/**
 * Main FSQL function
 */
export declare function main(
  sql: string,
  variables?: Record<string, object[]>,
): Promise<object[]>;
