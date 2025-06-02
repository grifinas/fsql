import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Arguments, CommandModule } from "yargs";
import { main } from ".";

interface SqlArgs extends Arguments {
    sql: string;
}

const parseCommand: CommandModule<{}, SqlArgs> = {
    command: "* <sql>",
    aliases: ["parse"],
    describe: "Parse and execute a SQL query",
    builder: (yargs) => {
        return yargs.positional("sql", {
            describe: "SQL query to parse and execute",
            type: "string",
            demandOption: true
        });
    },
    handler: async (argv: { sql: string }) => {
        try {
            console.log(main(argv.sql));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error:", errorMessage);
            process.exit(1);
        }
    }
};

void yargs(hideBin(process.argv))
    .command(parseCommand)
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
    .demandCommand(1)
    .help()
    .argv;
