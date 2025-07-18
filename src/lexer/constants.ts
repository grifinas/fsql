import { Token, Type } from "../token";

export const KEYWORD = {
    SELECT: new Token(Type.word, "SELECT"),
    FROM: new Token(Type.word, "FROM"),
    WHERE: new Token(Type.word, "WHERE"),
    INTO: new Token(Type.word, "INTO"),
    JOIN: new Token(Type.word, "JOIN"),
    ON: new Token(Type.word, "ON"),
    ORDER: new Token(Type.word, "ORDER"),
    BY: new Token(Type.word, "BY"),
    ASC: new Token(Type.word, "ASC"),
    DESC: new Token(Type.word, "DESC"),
    AS: new Token(Type.word, "AS"),
    AND: new Token(Type.word, "AND"),
} as const;

export const RESERVED_WORDS = Object.values(KEYWORD);