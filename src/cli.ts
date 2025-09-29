#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Arguments, CommandModule, Argv } from "yargs";
import { main } from ".";
import { logger, LogLevel, fileUtils } from "@utils";
import { startRepl } from "@repl";

interface SqlArgs extends Arguments {
  logLevel: LogLevel;
  sql?: string;
  repl?: boolean;
  file?: string;
  into?: string;
}

const parseCommand: CommandModule<object, SqlArgs> = {
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

void yargs(hideBin(process.argv))
  .command(parseCommand)
  .example(
    "$0 --repl",
    "Start the interactive REPL mode"
  )
  .example(
    "$0 --file query.sql",
    "Execute SQL from a file"
  )
  .example(
    "$0 'SELECT * FROM data.json'",
    "Parse and execute a simple SQL query"
  )
  .example(
    "$0 parse 'SELECT * FROM data.json'",
    "Parse and execute a simple SQL query (using explicit parse command)"
  )
  .example(
    "$0 'SELECT data FROM file.json >> SELECT nested FROM $0'",
    "Parse and execute a chained SQL query"
  )
  .check((argv) => {
    const hasFile = Boolean(argv.file);
    const hasRepl = Boolean(argv.repl);
    const hasSql = Boolean(argv._.length > 0);

    if (hasFile && hasSql) {
      throw new Error('Cannot provide both SQL query and --file option');
    }

    if (!hasFile && !hasRepl && !hasSql) {
      throw new Error('Provide a SQL query, use --repl for interactive mode, or use --file to execute from file');
    }

    return true;
  })
  .help().argv;
