import path from 'node:path';
import { build } from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import {getDestDir, absolutePath} from './paths.js';
import {readFile, writeFile, getConfig, getAllFiles, log} from './utils.js';
import {createTask} from './task.js';

const srcHTMLDir = 'src/html';

async function removeTopSourceComment(filePath) {
    let code = await readFile(filePath, 'utf8');
    code = code.replace(/^\s*<!--[\s\S]*?-->\s*/, '');
    await writeFile(filePath, code);
}

function fileExistsInConfig(config, absoluteFilePath) {
    const normalizedTarget = path.normalize(absoluteFilePath);
    for (const [dest, src] of Object.entries(config)) {
        for (const file of src) {
            const relativePath = absolutePath(file);
            if (path.normalize(relativePath) == normalizedTarget){
                return JSON.parse(`{"${dest}":["${file}"]}`);
            }
        }
    }
    return false;
}

async function esbuildHTML(config, isDebug, platform){
    let buildResult, outputs;
    const dir = getDestDir({isDebug, platform});
    for (const [dest, src] of Object.entries(config.entry)) {
        buildResult = await build({
            entryPoints: src,
            bundle: true,
            outdir: path.join(dir, dest),
            plugins: [htmlPlugin()],
            loader: {
                '.html': 'file'   // 🔥 Important
            },
            entryNames: config.filename,
            assetNames: config.filename,
            chunkNames: config.filename,
            metafile: true,
            write: true
        });

        if (!isDebug) {
            outputs = Object.keys(buildResult.metafile.outputs);
            for (const file of outputs) {
                if (file.endsWith('.html')) {
                    removeTopSourceComment(file);
                }
            }
        }
    }

}

export function createBundleHTMLTask(srcHTMLDir){
    const bundleHTML = async ({platforms, isDebug, logInfo, logWarn}) => {
        for(const platform of platforms){
            const config = await getConfig(platform);
            if(config.html){
                await esbuildHTML(config.html, isDebug, platform);
                if (logInfo) log.info(`Bundling HTML for ${platform}...`);
            } else{
                if(logWarn) log.warn(`No HTML config found for ${platform}, skipping HTML bundling.`);
            }
        }
    }

    const onChange = async (changedFiles, watcher, platforms, isDebug) => {
        for(const platform of platforms){
            let config = await getConfig(platform);
            if (!config.html) continue; // Skip if no HTML config for this platform
            const exists = fileExistsInConfig(
                config.html.entry,
                changedFiles[0]
            );
            if (exists){
                config.html.entry = exists;
                await esbuildHTML(config.html, isDebug, platform);
            }
        }
    }
    return createTask(
        'bundle HTML',
        bundleHTML,
    ).addWatcher(
      async () => {
        const currentWatchFiles = await getAllFiles(srcHTMLDir);
        return currentWatchFiles;
    }, onChange);
}

export default createBundleHTMLTask(srcHTMLDir);