import {getDestDir, absolutePath} from './paths.js';
import * as reload from './reload.js';
import {createTask} from './task.js';
import {readJSON, writeJSON, getAllFiles, pathExists} from './utils.js';

const srcManifestDir = 'src/manifest';

async function patchManifest(srcManifestDir, platform, isDebug, isWatch, isTest) {
    const manifestPath = `${srcManifestDir}/manifest-${platform}.json`;
    const existsManifest = await pathExists(manifestPath);
    const patched = await readJSON(existsManifest ? manifestPath : absolutePath(`${srcManifestDir}/manifest.json`));
    if (isDebug) {
        patched.version = '1';
        patched.description = `Debug build, platform: ${platform}, watch: ${isWatch ? 'yes' : 'no'}.`;
    } else {
        const packageJSON = await readJSON(absolutePath("package.json"));
        patched.version = packageJSON.version;
    }
    return patched;
}


async function bundleManifest(srcManifestDir, {platforms, isWatch, isDebug, isTest, logInfo}) {
    for (const platform of platforms) {
        const manifest = await patchManifest(srcManifestDir, platform, isDebug, isWatch, isTest);
        const destDir = getDestDir({isDebug, platform});
        await writeJSON(`${destDir}/manifest.json`, manifest);
        if (logInfo) log.info(`Bundled manifest for platform ${platform}.`);
    }

}
export function bundleManifestTask(srcManifestDir){
    const onChange = async (changedFiles, watcher, platforms, isDebug) => {
        await bundleManifest(srcManifestDir, {platforms, isWatch: true, isDebug, isTest: false});
        reload.reload({type: reload.FULL});
    }
    return createTask(
        'bundle-manifest',
        (options) => bundleManifest(srcManifestDir, options),
    ).addWatcher(
        async () => {
            const currentWatchFiles = await getAllFiles(srcManifestDir);
            return currentWatchFiles;
        },
        onChange,
    );
}

export default bundleManifestTask(srcManifestDir);