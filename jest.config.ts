import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testMatch: ["**/test/**/*.(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts", "json"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jestSetup.ts"],
};

export default config;
