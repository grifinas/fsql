import { logger } from "../utils/logger";
import { SQLFactory } from "./sqlFactory";
import { SQLFunction, ValidatedArgs } from "./sqlFunction";
import * as z from "zod";

const Validation = z.tuple([
    z.string(),
    z.string()
]);

export class LikeFunction extends SQLFunction<boolean, typeof Validation> {
    public validation(): typeof Validation {
        return Validation;
    }

    public subResolve(args: ValidatedArgs<this>): boolean {
        const [text, pattern] = args;
        
        // Convert SQL LIKE pattern to JavaScript RegExp
        // First handle % and _ wildcards, then escape other regex chars
        let regexPattern = pattern
            .replace(/%/g, '§PERCENT§')               // Temporarily replace %
            .replace(/_/g, '§SINGLE§')                // Temporarily replace _
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Escape regex special chars
            .replace(/§PERCENT§/g, '.*')              // % matches any sequence
            .replace(/§SINGLE§/g, '.');               // _ matches any single char
        
        // Anchor the pattern to match the entire string
        regexPattern = '^' + regexPattern + '$';

        logger.debug("Like pattern", pattern,regexPattern, text);
        
        const regex = new RegExp(regexPattern, 'i'); // Case-insensitive by default
        return regex.test(text);
    }
}

SQLFactory.register("LIKE", LikeFunction);
