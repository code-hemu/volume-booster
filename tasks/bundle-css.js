import path from 'node:path';
import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import {getDestDir} from './paths.js';
import {readFile, writeFile, getConfig, getAllFiles, log, fileExistsInConfig} from './utils.js';
import {createTask} from './task.js';

const srcSCSSDir = 'src/scss';

async function removeTopSourceComment(filePath) {
    let code = await readFile(filePath, 'utf8');
    const newCode = code.replace(/^\/\*[\s\S]*?\*\//, '');
    await writeFile(filePath, newCode);
}

async function esbuildCSS(config, isDebug, platform) {
    let buildResult;
    let outputs;
    const dir = getDestDir({isDebug, platform});
    
    for (const [dest, src] of Object.entries(config.entry)) {
        buildResult = await build({
            entryPoints: src,
            outdir: path.join(dir, dest),
            entryNames: config.filename,
            loader: {
                '.scss': 'css'
            },
            plugins: [
            sassPlugin({
                    type: 'css',
                    sourceMap: config.sourcemap,
                })
            ],
            minify: config.minify,
            sourcemap: config.sourcemap,
            metafile: true,
            write: true
        });

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
    let currentWatchFiles;
    const bundleCSS = async ({platforms, isDebug, logInfo, logWarn}) => {
        for(const platform of platforms){
            const config = (await getConfig(platform));
            const scssConfig = config.scss;
            if (scssConfig){
                await esbuildCSS(scssConfig, isDebug, platform);
                if (logInfo) log.ok(`Bundling CSS for ${platform}...`);
            } else {
                if(logWarn) log.warn(`No SCSS config found for ${platform}, skipping CSS bundling.`);
            } 
        }
    }

    const onChange = async (changedFiles, watcher, platforms, isDebug) => {
        for(const platform of platforms){
            const config = await getConfig(platform);
            if (config.scss){
                const exists = await fileExistsInConfig(
                    config.scss.entry,
                    changedFiles[0]
                );
                if (exists){
                    let newConfig = {
                        scss: {
                            entry: exists,
                            filename: config.scss.filename,
                            minify: config.scss.minify,
                            sourcemap: config.scss.sourcemap
                        }
                    }
                    await esbuildCSS(newConfig.scss, isDebug, platform);
                }
                
            }
        }

        const newWatchFiles = await getAllFiles(srcSCSSDir);
        watcher.unwatch(
            currentWatchFiles.filter((oldFile) => !newWatchFiles.includes(oldFile))
        );
        watcher.add(
            newWatchFiles.filter((newFile) => currentWatchFiles.includes(newFile))
        );
    }
    return createTask(
        'bundle CSS',
        bundleCSS,
    ).addWatcher(
        async () => {
            currentWatchFiles = await getAllFiles(srcSCSSDir);
            return currentWatchFiles;
        }, onChange);
}

export default createBundleCSSTask(srcSCSSDir);