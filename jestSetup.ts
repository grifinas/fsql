import "@src/sqlFunctions";
import { logger, LogLevel } from '@utils';
import { pluginRegistry } from "./src";
import { JsonReaderPlugin } from "@src/plugins/readers/json.plugin";

jest.mock("@src/utils/dir", () => ({
    currentDir: "/test"
}));
pluginRegistry.register(new JsonReaderPlugin());
logger.setLevel(LogLevel.DEBUG);
