import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Arguments, CommandModule, Argv } from "yargs";
import { main } from ".";
import { logger, LogLevel, fileUtils } from "./utils";
import { startRepl } from "./repl";

interface SqlArgs extends Arguments {
    sql: string;
    repl: boolean;
    logLevel: LogLevel;
    file?: string;
    into?: string;
}

const parseCommand: CommandModule<{}, SqlArgs> = {
    command: "*",
    aliases: ["parse"],
    describe: "Parse and execute a SQL query",
    builder: (yargs: Argv<{}>): Argv<SqlArgs> => {
        yargs.positional("sql", {
            describe: "SQL query to parse and execute",
            type: "string",
            demandOption: false,
            default: "",
        });

        yargs.boolean('repl').describe('repl', 'Start the REPL').default('repl', false).conflicts('repl', 'file');
        yargs.string('file').describe('file', 'File to parse and execute').conflicts('file', 'repl');
        yargs.number('logLevel').describe('logLevel', 'Log level [0-4]').choices('logLevel', [LogLevel.NONE, LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG]).default('logLevel', LogLevel.ERROR);
        yargs.string('into').describe('into', 'File to write the result to');

        return yargs as Argv<SqlArgs>;
    },
    handler: async (argv: SqlArgs) => {
        logger.setLevel(argv.logLevel);
        if (argv.repl) {
            logger.info("Starting REPL");
            const result = await startRepl();
            if (result && argv.into) {
                fileUtils.writeJson(argv.into, result);
            }
            return;
        }

        if (argv.file) {
            logger.info("Starting file execution");
            argv.sql = await fileUtils.readSql(argv.file);
        }

        if (!argv.sql) {
            logger.error("No SQL query provided. Use --repl for interactive mode or provide a SQL query.");
            yargs.showHelp();
            process.exit(1);
        }

        try {
            const result = await main(argv.sql);
            console.log(result);
            if (argv.into) {
                fileUtils.writeJson(argv.into, result);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error("Error:", errorMessage);
            process.exit(1);
        }
    }
};

void yargs(hideBin(process.argv))
    .command(parseCommand)
    .example(
        "$0 --repl",
        "Start the interactive REPL mode"
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
    .demandCommand(0, 1, 'Provide a SQL query or use --repl for interactive mode')
    .help()
    .argv;
