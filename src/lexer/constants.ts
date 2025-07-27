import { TokenMatcher } from "../tokenizer";
import { Type } from "../types";

export const KEYWORD = {
    SELECT: new TokenMatcher(Type.word, "SELECT"),
    FROM: new TokenMatcher(Type.word, "FROM"),
    WHERE: new TokenMatcher(Type.word, "WHERE"),
    INTO: new TokenMatcher(Type.word, "INTO"),
    JOIN: new TokenMatcher(Type.word, "JOIN"),
    ON: new TokenMatcher(Type.word, "ON"),
    ORDER: new TokenMatcher(Type.word, "ORDER"),
    BY: new TokenMatcher(Type.word, "BY"),
    ASC: new TokenMatcher(Type.word, "ASC"),
    DESC: new TokenMatcher(Type.word, "DESC"),
    AS: new TokenMatcher(Type.word, "AS"),
    AND: new TokenMatcher(Type.word, "AND"),
} as const;

export const RESERVED_WORDS = Object.values(KEYWORD);

export const Symbols = {
    SLASH: new TokenMatcher(Type.special, "/"),
    AT: new TokenMatcher(Type.special, "@"),
    OPEN_PARENTHESIS: new TokenMatcher(Type.parenthesis, "("),
    CLOSE_PARENTHESIS: new TokenMatcher(Type.parenthesis, ")"),
    ALL: new TokenMatcher(Type.special, "*"),
}

export const ANY = {
    WORD: new TokenMatcher(Type.word),
    NUMBER: new TokenMatcher(Type.number),
    BRACKET: new TokenMatcher(Type.bracket),
    BRACE: new TokenMatcher(Type.brace),
    PARENTHESIS: new TokenMatcher(Type.parenthesis),
    SPECIAL: new TokenMatcher(Type.special),
    DOT: new TokenMatcher(Type.dot),
    COMMA: new TokenMatcher(Type.comma),
    SEMICOLON: new TokenMatcher(Type.semicolon),
    EQUALS: new TokenMatcher(Type.equals),
    COMP: new TokenMatcher(Type.comp),
    STRING: new TokenMatcher(Type.string),
} as const;