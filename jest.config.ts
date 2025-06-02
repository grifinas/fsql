import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testMatch: ["**/test/**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts", "json"],
  testEnvironment: "node",
};

export default config;
