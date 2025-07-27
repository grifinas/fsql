import * as readline from 'readline';
import { logger } from './utils/logger';
import { main } from '.';

export async function startRepl(): Promise<object[] | null> {
    return new Promise((resolve) => {
        let lastResult: object[] | null = null;
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'sqlparse> '
        });

        logger.info('Welcome to SQLParse REPL!');
        logger.info('Type your SQL queries or ".exit" to quit.');
        logger.info('');
        
        rl.prompt();

        rl.on('line', async (input: string) => {
            const trimmedInput = input.trim();
            
            if (trimmedInput === '.exit' || trimmedInput === '.quit') {
                logger.info('Goodbye!');
                rl.close();
                resolve(lastResult);
                return;
            }
            
            if (trimmedInput === '') {
                rl.prompt();
                return;
            }
            
            if (trimmedInput === '.help') {
                logger.info('Available commands:');
                logger.info('  .exit, .quit  - Exit the REPL');
                logger.info('  .help         - Show this help message');
                logger.info('  <SQL query>   - Execute a SQL query');
                logger.info('');
                rl.prompt();
                return;
            }
            
            try {
                const result = await main(trimmedInput, {'@0': lastResult || []});
                lastResult = result;
                console.log(JSON.stringify(result, null, 2));
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.error('Error:', errorMessage);
            }
            
            rl.prompt();
        });

        rl.on('close', () => {
            resolve(lastResult);
        });

        // Handle Ctrl+C gracefully
        rl.on('SIGINT', () => {
            logger.info('\nUse .exit or .quit to exit the REPL');
            rl.prompt();
        });
    });
}