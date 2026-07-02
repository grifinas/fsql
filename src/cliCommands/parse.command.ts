import { Arguments, CommandModule, Argv } from "yargs";
import { fileUtils, logger, LogLevel } from "@utils";
import { startRepl } from "@repl";
import { main } from "@main";

interface SqlArgs extends Arguments {
  logLevel: LogLevel;
  sql?: string;
  repl?: boolean;
  file?: string;
  into?: string;
}

export const parseCommand: CommandModule<object, SqlArgs> = {
  command: "*",
  aliases: ["parse"],
  describe: "Parse and execute a SQL query",
  builder: (yargs: Argv<object>): Argv<SqlArgs> => {
    yargs.positional("sql", {
      describe: "SQL query to parse and execute",
      type: "string",
      demandOption: false,
      default: "",
    });

    yargs
      .boolean("repl")
      .describe("repl", "Start the REPL")
      .conflicts("repl", "file");
    yargs
      .string("file")
      .describe("file", "File to parse and execute")
      .conflicts("file", "repl");
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
    yargs.string("into").describe("into", "File to write the result to");

    return yargs as Argv<SqlArgs>;
  },
  handler: async (argv: SqlArgs) => {
    logger.setLevel(argv.logLevel);
    logger.debug("CLI arguments:", argv);
    if (argv.repl) {
      logger.info("Starting REPL");
      const result = await startRepl();
      if (result && argv.into) {
        await fileUtils.writeJson(argv.into, result);
      }
      return;
    }

    if (argv.file) {
      logger.info("Starting file execution");
      argv.sql = await fileUtils.readSql(argv.file);
    }

    if (!argv.sql && argv._.length > 0) {
      argv.sql = argv._[0] as string;
    }

    if (!argv.sql) {
      logger.error(
        "No SQL query provided. Use --repl for interactive mode or provide a SQL query.",
      );
      process.exit(1);
    }

    try {
      const result = await main(argv.sql);
      console.log(result);
      if (argv.into) {
        fileUtils.writeJson(argv.into, result);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Error:", errorMessage);
      process.exit(1);
    }
  },
};
