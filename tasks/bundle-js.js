import path from 'node:path';
import { build } from 'esbuild';
import {getDestDir} from './paths.js';
import {readFile, writeFile, getConfig, getAllFiles, log, fileExistsInConfig} from './utils.js';
import {createTask} from './task.js';

const srcJSDir = 'src/js';

async function removeTopSourceComment(filePath) {
    let code = await readFile(filePath, 'utf8');
    const newCode = code.replace(/^\/\/.*\n/, '');
    await writeFile(filePath, newCode);
}

async function esbuildJS(config, isDebug, platform){
    // console.log(`Starting JS build for ${config}...`);
    let buildResult, outputs;
    const dir = getDestDir({isDebug, platform});
    for (const [dest, src] of Object.entries(config.entry)) {
        buildResult = await build({
            entryPoints: src,
            bundle: false,
            outdir: path.join(dir, dest),
            entryNames: config.filename,
            loader: {
                '.js': 'js'
            },
            minify: config.minify,
            sourcemap: config.sourcemap,
            drop: !isDebug ? ['console', 'debugger'] : [],
            metafile: true,
            write: true
        });

        if (!isDebug) {
            outputs = Object.keys(buildResult.metafile.outputs);
            for (const file of outputs) {
                if (file.endsWith('.js')) {
                    removeTopSourceComment(file);
                }
            }
        }
    }

}

export function createBundleJSTask(srcJSDir){
    let currentWatchFiles;
    const bundleJS = async ({platforms, isDebug, logInfo}) => {
        for(const platform of platforms){
            const config = /** @type {any} */ (await getConfig(platform));
            if (config.js) {
                if (logInfo) log.ok(`Bundling JS for ${platform}...`);
                await esbuildJS(config.js, isDebug, platform);
            } else {
                if(logInfo) log.warn(`No JS config found for ${platform}, skipping JS bundling.`);
            }
        }
    }

    const onChange = async (changedFiles, watcher, platforms, isDebug) => {
        for (const platform of platforms) {
            const config = await getConfig(platform);

            if (!config.js) continue;

            const exists = await fileExistsInConfig(
                config.js.entry,
                changedFiles.join(', ')
            );

            if (exists) {
                let newConfig = {
                  js: {
                    entry: exists,
                    filename: config.js.filename,
                    minify: config.js.minify,
                    sourcemap: config.js.sourcemap
                  }
                };
                await esbuildJS(newConfig.js, isDebug, platform);
            }
        }
    };

    return createTask(
        'bundle JS',
        bundleJS,
    ).addWatcher(
      async () => {
        currentWatchFiles = await getAllFiles(srcJSDir);
        return currentWatchFiles;
    }, onChange);
}
export default createBundleJSTask(srcJSDir);