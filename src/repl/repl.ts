import * as readline from "readline";
import { fileUtils, logger } from "@utils";
import { main } from "@main";
import { completer } from "./completer";

export async function startRepl(): Promise<object[] | null> {
  return new Promise((resolve) => {
    const variables: Record<string, object[]> = {
      "@0": [],
    };
    const lsPromise = fileUtils.listFiles().then((files) => {
      variables["@ls"] = files;
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "sqlparse> ",
      completer: completer,
    });

    logger.info("Welcome to SQLParse REPL!");
    logger.info('Type your SQL queries or ".exit" to quit.');
    logger.info("");

    rl.prompt();

    rl.on("line", async (input: string) => {
      const trimmedInput = input.trim();

      if (trimmedInput === ".exit" || trimmedInput === ".quit") {
        logger.info("Goodbye!");
        rl.close();
        resolve(variables["@0"]);
        return;
      }

      if (trimmedInput === "") {
        rl.prompt();
        return;
      }

      if (trimmedInput === ".help") {
        logger.info("Available commands:");
        logger.info("  .exit, .quit  - Exit the REPL");
        logger.info("  .help         - Show this help message");
        logger.info("  <SQL query>   - Execute a SQL query");
        logger.info("");
        rl.prompt();
        return;
      }

      try {
        await lsPromise; //Should only impede performance before the first execution
        const result = await main(trimmedInput, variables);
        variables["@0"] = result;
        console.log(JSON.stringify(result, null, 2));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Error:", errorMessage);
      }

      rl.prompt();
    });

    rl.on("close", () => {
      resolve(variables["@0"]);
    });

    // Handle Ctrl+C gracefully
    let sigintCount = 0;
    let sigintTimer: ReturnType<typeof setTimeout> | null = null;

    rl.on("SIGINT", () => {
      sigintCount++;

      if (sigintCount === 2) {
        logger.info("\nReceived double Ctrl+C, exiting...");
        rl.close();
        return;
      }

      // Reset counter after 1.5 seconds
      if (sigintTimer) {
        clearTimeout(sigintTimer);
      }
      sigintTimer = setTimeout(() => {
        sigintCount = 0;
      }, 1500);

      logger.info("\nPress Ctrl+C again to exit, or use .exit/.quit");
      rl.prompt();
    });
  });
}
