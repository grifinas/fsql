const { build } = require('esbuild');
const path = require('path');
const fs = require('fs/promises');

const config = {
    entryPoints: [
        'src/index.ts',
        'src/cli.ts'
    ],
    bundle: true,
    outdir: 'dist',
    format: 'esm',
    platform: 'node',
    target: 'node16',
    sourcemap: true,
    outExtension: { '.js': '.mjs' },
    resolveExtensions: ['.ts', '.js'],
    alias: {
        '@data': path.resolve(__dirname, 'src/data/index.ts'),
        '@entities': path.resolve(__dirname, 'src/entities/index.ts'),
        '@lexer': path.resolve(__dirname, 'src/lexer/index.ts'),
        '@sqlFunctions': path.resolve(__dirname, 'src/sqlFunctions/index.ts'),
        '@tokenizer': path.resolve(__dirname, 'src/tokenizer/index.ts'),
        '@utils': path.resolve(__dirname, 'src/utils/index.ts'),
        '@repl': path.resolve(__dirname, 'src/repl/index.ts'),
        '@types': path.resolve(__dirname, 'src/types.ts'),
        '@main': path.resolve(__dirname, 'src/index.ts'),
        '@src': path.resolve(__dirname, 'src')
    },
    external: [
        'yargs',
        'zod'
    ],
    banner: {
        js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
    }
};


const builtInPlugins = [
    'json'
];

Promise.all([
    build(config),
    build({
        ...config,
        entryPoints: builtInPlugins.map(p => `src/plugins/readers/${p}.plugin.ts`),
        outdir: 'dist/plugins',
    })
]).then(() => Promise.all([
    fs.writeFile('dist/plugins.json', JSON.stringify(builtInPlugins.map(p => ({ name: p, module: `./plugins/${p}.plugin.mjs`, enabled: true })), null, 2)),
])
).then(() => {
    console.log('✅ Build completed successfully');
}).catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
