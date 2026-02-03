import process from 'node:process';
import createFolder from './folder.js';
import bundleCSS from './bundle-css.js';


import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// import {bundleJS} from './bundle-js.js';

import {log} from './utils.js';
import {runTasks} from './task.js';

const args = process.argv.slice(2);

// -----------------------------
// Detect target platform
// -----------------------------

const platforms = [
    'chrome-mv3',
    'edge-mv3',
    'opera-mv3',
    'firefox-mv2',
    'thunderbird'
];

let platform = [];

if (args.includes('--all')) {
    platform = platforms;
} else {
    if (args.includes('--chrome-mv3')) platform.push('chrome-mv3');
    if (args.includes('--edge-mv3')) platform.push('edge-mv3');
    if (args.includes('--firefox-mv2')) platform.push('firefox-mv2');
    if (args.includes('--opera-mv3')) platform.push('opera-mv3');
    if (args.includes('--thunderbird')) platform.push('thunderbird');
}


const settings = {
    platforms: platform,
    isWatch: args.includes('--watch'),
    isRelease: args.includes('--release'),
    isDebug: args.includes('--debug'),
    isTest: args.includes('--test'),
    logInfo: args.includes('--log-info'),
    logWarn: args.includes('--log-warn')
}

const standardTask = [
    createFolder,
    bundleCSS
];

async function build() {
    log.ok('--------------------------------');
    log.ok('🚀 Build started');
    try {
        await runTasks(standardTask, settings);
        if (settings.isWatch) {
            standardTask.forEach((task) => task.watch(settings.platforms));
            log.ok('✔ Watching...');
        } else {
            log.ok('MISSION PASSED! RESPECT +');
        }
    }catch (err) {
        console.log(err);
        log.error(`MISSION FAILED!`);
        process.exit(13);
    }
}

build();

// if (isWatch) {
//     console.log('👀 Watch mode enabled');
//     fs.watch(path.resolve('./src'), { recursive: true }, async () => {
//         console.log('🔄 File changed — rebuilding...');
//         // await build();
//     });
// } else {
//     build();
// }



// async function runBuild(target) {
//     const env = prepareEnvironment({
//         mode: isRelease ? 'release' : 'dev',
//         target
//     });

//     const config = await loadConfiguration({
//         target,
//         mode: env.mode
//     });

//     bundleJS(config["esbuild"], env, target);
//     // bundleCSS(config["less"], env, target);

// }







