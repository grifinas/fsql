import { Token, Type } from "../token";

export const RESERVED_WORDS = [
    new Token(Type.word, "SELECT", 0),
    new Token(Type.word, "FROM", 0),
    new Token(Type.word, "WHERE", 0),
    new Token(Type.word, "INTO", 0),
    new Token(Type.word, "JOIN", 0),
    new Token(Type.word, "ON", 0),
    new Token(Type.word, "ORDER BY", 0),
    new Token(Type.word, "AS", 0),
] as const;