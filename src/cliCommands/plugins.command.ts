import { Arguments, CommandModule, Argv } from "yargs";
import { logger, LogLevel } from "@utils";
import { pluginRegistry } from "@plugins";

interface PluginsArgs extends Arguments {
  logLevel: LogLevel;
  list?: boolean;
}

export const pluginsCommand: CommandModule<object, PluginsArgs> = {
  command: "plugins",
  describe: "Manage and inspect plugins",
  builder: (yargs: Argv<object>): Argv<PluginsArgs> => {
    yargs
      .boolean("list")
      .describe("list", "List all currently loaded plugins")
      .alias("list", "l");

    yargs
      .number("logLevel")
      .describe("logLevel", "Log level [0-5]")
      .choices("logLevel", [
        LogLevel.NONE,
        LogLevel.ERROR,
        LogLevel.WARN,
        LogLevel.INFO,
        LogLevel.VERBOSE,
        LogLevel.DEBUG,
      ])
      .default("logLevel", LogLevel.INFO);

    return yargs as Argv<PluginsArgs>;
  },
  handler: async (argv: PluginsArgs) => {
    logger.setLevel(argv.logLevel);

    // Load external pluginsk
    await pluginRegistry.loadExternalPlugins();

    if (argv.list) {
      const plugins = pluginRegistry.getAllPlugins();
      const supportedExtensions = pluginRegistry.getSupportedExtensions();

      console.log("📦 Loaded Plugins:");
      console.log("==================");

      if (plugins.length === 0) {
        console.log("No plugins loaded.");
        return;
      }

      plugins.forEach((plugin, index) => {
        console.log(`${index + 1}. ${plugin.name}`);
        console.log(
          `   Extensions: ${plugin.extensions.map((ext) => `.${ext}`).join(", ")}`,
        );
        console.log("");
      });

      console.log(`📋 Summary:`);
      console.log(`   Total plugins: ${plugins.length}`);
      console.log(
        `   Supported extensions: ${supportedExtensions.map((ext) => `.${ext}`).join(", ")}`,
      );
    } else {
      // Default behavior - show help
      console.log("Use --list to see all loaded plugins");
      console.log("Example: fsql plugins --list");
    }
  },
};
