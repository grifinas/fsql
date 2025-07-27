import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testMatch: ["**/test/**/*.(spec|test).ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true
    }],
  },
  moduleFileExtensions: ["js", "ts", "json"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jestSetup.ts"],
  
  // Clean output formatting - just show test names with ✓ or ✗
  verbose: false,
  silent: true,
  noStackTrace: true,
  passWithNoTests: true,
  collectCoverage: false,
  testFailureExitCode: 1,
  errorOnDeprecated: false,
  moduleNameMapper: {
    "^@data$": "<rootDir>/src/data/index",
    "^@entities$": "<rootDir>/src/entities/index",
    "^@lexer$": "<rootDir>/src/lexer/index",
    "^@sqlFunctions$": "<rootDir>/src/sqlFunctions/index",
    "^@tokenizer$": "<rootDir>/src/tokenizer/index",
    "^@utils$": "<rootDir>/src/utils/index",
    "^@types$": "<rootDir>/src/types",
    "^@src/(.*)$": "<rootDir>/src/$1"
  },
};

export default config;
