import process from 'node:process';
import createFolder from './folder.js';
import bundleCSS from './bundle-css.js';
import bundleJS from './bundle-js.js';
import bundleHTML from './bundle-html.js';
import bundleLocales from './bundle-locales.js';
import bundleManifest from './bundle-manifest.js';
import assetsCopy from './copy.js';
import zip from './zip.js';
import {log} from './utils.js';
import {runTasks} from './task.js';

const args = process.argv.slice(2);

const platforms = [
    'chrome',
    'edge',
    'naver',
    'opera'
];

let platform = [];

if (args.includes('--all')) {
    platform = platforms;
} else {
    if (args.includes('--chrome')) platform.push('chrome');
    if (args.includes('--edge')) platform.push('edge');
    if (args.includes('--opera')) platform.push('opera');
    if (args.includes('--naver')) platform.push('naver');
}

const versionArg = args.find((a) => a.startsWith('--version='));
const version = versionArg ? versionArg.substring('--version='.length) : null;

const settings = {
    platforms: platform,
    version: version,
    isWatch: args.includes('--watch'),
    isRelease: args.includes('--release'),
    isDebug: args.includes('--debug'),
    isTest: args.includes('--test'),
    logInfo: args.includes('--log-info'),
    logWarn: args.includes('--log-warn')
}

console.log(settings)
const standardTask = [
    createFolder,
    bundleHTML,
    bundleCSS,
    bundleJS,
    bundleLocales,
    bundleManifest,
    assetsCopy
];

const buildTask = [
    ...standardTask,
    zip,
];

(async () => {
    log.ok('--------------------------------');
    log.ok('🚀 Build started');
    try {
        await runTasks(settings.isDebug ? standardTask : buildTask, settings);
        if (settings.isWatch) {
            standardTask.forEach((task) => task.watch(settings.platforms, settings.isDebug));
            log.ok('👀 Watching...');
        } else {
            log.ok('MISSION PASSED! RESPECT +');
        }
    }catch (err) {
        console.log(err);
        log.error(`MISSION FAILED!`);
        process.exit(13);
    }
})();
