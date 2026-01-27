import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import {log} from './utils.js';
import {localstorage} from './storage.js';

const storage = localstorage.get('args');

// remove source comment
function removeTopSourceComment(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/^\/\/.*\n/, '');
    fs.writeFileSync(filePath, code);
}

async function loadConfiguration({ target, mode }) {
    log.ok('Loading configuration...');

    const config = {
        entry: {
            'data/interface': ['src/ts/index.ts','src/ts/service.ts']
        },
        filename: '[name].js',
        target: 'es2020',
        minify: false,
        sourcemap: false,
        define: {
            __DEV__: 'false'
        }
    };

    const targetConfigPath = path.resolve(`config/${target}.js`);

    if (fs.existsSync(targetConfigPath)) {
        const targetConfig = await import(
            pathToFileURL(targetConfigPath).href
        );
        Object.assign(config, targetConfig.default ?? targetConfig);
    }

    log.ok('Configuration loaded');

    return config;
}

export const bundleJS = async({env, target})=> {
    const config = await loadConfiguration({
        target,
        mode: env.mode
    });

    log.ok(`📦 Building → ${target}`);
    log.ok('Minify    : ' + config.minify);
    log.ok('Sourcemap : ' + config.sourcemap);

    var result, outputs;

    for (const [key, item] of Object.entries(config.entry)) {
        log.ok(`Folder Create: ${key}`);
        result = await esbuild.build({
            entryPoints: item,
            bundle: true,

            outdir: path.join(env.distDir, key),
            entryNames: '[name]',

            platform: 'browser',
            format: 'esm',
            target: 'es2020',
            
            loader: {
                '.ts': 'ts',
                '.js': 'js'
            },

            minify: config.minify,
            drop: (storage.isRelease ? storage.isRelease : false) ? ['console', 'debugger'] : [],
            sourcemap: config.sourcemap,
            metafile: true,
            write: true
        });

        if (!(storage.isRelease ? storage.isRelease : false)) return;
        outputs  = Object.keys(result.metafile.outputs);
        for (const file of outputs) {
            if (file.endsWith('.js')) {
                removeTopSourceComment(file);
            }
        }
    }

    log.ok(`✅ ${target} build completed`);
}