import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';
import {log} from './utils.js';


// remove source comment
function removeTopSourceComment(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/^\/\/.*\n/, '');
    fs.writeFileSync(filePath, code);
}


async function bundleCSSEntry(entry) {

}
export const bundleJS = async(config, env, target)=> {
    var result, outputs;

    for (const [key, item] of Object.entries(config.entry)) {
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
            drop: env.mode == 'production' ? ['console', 'debugger'] : [],
            sourcemap: config.sourcemap,
            metafile: true,
            write: true
        });

        if (!env.mode == 'production') return;
        outputs  = Object.keys(result.metafile.outputs);
        for (const file of outputs) {
            if (file.endsWith('.js')) {
                removeTopSourceComment(file);
            }
        }
    }

}