
import {getDestDir} from './paths.js';
import {copyFile, getAllFiles, getConfig, log} from './utils.js';
import {createTask} from './task.js';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

export function createCopyTask() {
    const paths = [];
    const assetsCopy = async ({platforms, isDebug, logInfo, logWarn}) => {
        for(const platform of platforms){
            const config = await getConfig(platform);
            if (config.assets) {
                for (const [dest, sources] of Object.entries(config.assets.entry)) {
                    const srcList = Array.isArray(sources) ? sources : [sources];

                    for (const src of srcList) {
                        const files = await getAllFiles(src);

                        for (const file of files) {
                            const destDir = path.join(getDestDir({isDebug, platform}), dest);
                            await mkdir(destDir, { recursive: true });

                            const destFile = path.join(destDir, path.basename(file));
                            await copyFile(file, destFile);
                        }
                    }
                }
                if (logInfo) log.ok(`Copying assets for ${platform}...`);
            } else{
                if(logWarn) log.warn(`No assets config found for ${platform}, skipping assets copy.`);
            }
        }

    }
    const onChange = async (changedFiles, watcher, platforms, isDebug) => {
        await assetsCopy({platforms, isDebug, logInfo: false, logWarn: false})
    }
    return createTask(
        'assets copy',
        assetsCopy,
    ).addWatcher(
        paths,
        onChange,
    );
}


export default createCopyTask();