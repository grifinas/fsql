#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { parseCommand } from "./cliCommands/parse.command";
import { pluginsCommand } from "./cliCommands/plugins.command";

void yargs(hideBin(process.argv))
  .command(parseCommand)
  .command(pluginsCommand)
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
  .example(
    "$0 plugins --list",
    "List all currently loaded plugins"
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
