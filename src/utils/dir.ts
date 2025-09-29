// @ts-expect-error ESM version of __dirname, jest can mock this
export const currentDir = import.meta.dirname;
