import path from 'node:path';
import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import * as reload from './reload.js';
import {getDestDir, absolutePath} from './paths.js';
import {readFile, writeFile, getConfig, getAllFiles, log} from './utils.js';
import {createTask} from './task.js';

const srcSCSSDir = 'src/scss';

async function removeTopSourceComment(filePath) {
    let code = await readFile(filePath, 'utf8');
    code = code.replace(/^\/\*[\s\S]*?\*\//, '');
    await writeFile(filePath, code);
}

function fileExistsInConfig(config, absoluteFilePath) {
    const normalizedTarget = path.normalize(absoluteFilePath);

    for (const [dest, src] of Object.entries(config)) {
        for (const file of src) {
            const relativePath = absolutePath(file);
            if (path.normalize(relativePath) == normalizedTarget){
                return JSON.parse(`{"${dest}":["${src}"]}`);
            }
        }
    }
    return false;
}

async function esbuildCSS(config, isDebug, platform) {
    let buildResult, outputs;
    const dir = getDestDir({isDebug, platform});
    
    for (const [dest, src] of Object.entries(config.entry)) {
        buildResult = await build({
            entryPoints: src,
            bundle: true,
            outdir: path.join(dir, dest),
            entryNames: config.filename,
            loader: {
                '.scss': 'css'
            },
            plugins: [
            sassPlugin({
                    type: 'css',
                    sourceMap: isDebug? true: config.sourcemap,
                })
            ],
            minify: isDebug? false : config.minify,
            sourcemap: isDebug? true : config.sourcemap,
            metafile: true,
            write: true
        });
        // Only skip comment removal in debug
        if (!isDebug) {
            outputs = Object.keys(buildResult.metafile.outputs);
            for (const file of outputs) {
                if (file.endsWith('.css')) {
                    await removeTopSourceComment(file);
                }
            }
        }
    }
}

export function createBundleCSSTask(srcSCSSDir){
    const bundleCSS = async ({platforms, isDebug, logInfo, logWarn}) => {
        for(const platform of platforms){
            const config = await getConfig(platform);
            if (config.scss){
                await esbuildCSS(config.scss, isDebug, platform);
                if (logInfo) log.info(`Bundling CSS for ${platform}...`);
            } else {
                if(logWarn) log.warn(`No SCSS config found for ${platform}, skipping CSS bundling.`);
            } 
        }

    }

    const onChange = async (changedFiles, watcher, platforms, isDebug) => {
        for(const platform of platforms){
            let config = await getConfig(platform);
            if (config.scss){
                const exists = fileExistsInConfig(
                    config.scss.entry,
                    changedFiles[0]
                );
                if (exists){
                    config.scss.entry = exists;
                    await esbuildCSS(config.scss, isDebug, platform);
                }
            }
        }

        reload.reload({type: reload.CSS});

    }

    return createTask(
        'bundle CSS',
        bundleCSS,
    ).addWatcher(
        async () => {
            const currentWatchFiles = await getAllFiles(srcSCSSDir);
            return currentWatchFiles;
        }, onChange);
     
}

export default createBundleCSSTask(srcSCSSDir);