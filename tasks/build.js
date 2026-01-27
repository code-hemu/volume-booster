import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {localstorage} from './storage.js';
import {bundleJS} from './bundle-js.js';
import {log} from './utils.js';


const args = process.argv.slice(2);

const isWatch = args.includes('--watch');
const isRelease = args.includes('--release');
const isDebug = args.includes('--debug');
const isTest = args.includes('--test');

const logInfo = args.includes('--log-info');
const logWarn = args.includes('--log-warn');

// -----------------------------
// Detect target platform
// -----------------------------

const ALL_TARGETS = [
    'chrome-mv3',
    'edge-mv3',
    'opera-mv3',
    'firefox-mv2',
    'thunderbird'
];

let targets = [];

if (args.includes('--all')) {
    targets = ALL_TARGETS;
} else {
    if (args.includes('--chrome-mv2')) targets.push('chrome-mv2');
    if (args.includes('--chrome-mv3')) targets.push('chrome-mv3');
    if (args.includes('--firefox')) targets.push('firefox');
    if (args.includes('--thunderbird')) targets.push('thunderbird');
}

localstorage.set("args", {
   "targets": targets,
   "isWatch": isWatch,
   "isRelease": isRelease,
   "isDebug": isDebug,
   "isTest": isTest,
   "logInfo": logInfo,
   "logWarn": logWarn
});


function prepareEnvironment({ mode, target }) {
    log.ok('Preparing environment...');

    process.env.NODE_ENV = mode === 'release'
        ? 'production'
        : 'development';

    const distDir = path.resolve(`build/${mode == 'release' ? 'release' : 'debug'}` , target);

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    for (const file of fs.readdirSync(distDir)) {
        fs.rmSync(path.join(distDir, file), { recursive: true, force: true });
    }

    log.ok('Environment ready');

    return {
        distDir,
        mode: process.env.NODE_ENV
    };
}

async function runBuild(target) {
    const env = prepareEnvironment({
        mode: isRelease ? 'release' : 'dev',
        target
    });

    bundleJS({env, target});
}

async function build() {
    log.ok('--------------------------------');
    log.ok('🚀 Build started');

    for (const target of targets) {
        await runBuild(target);
    }
}

if (isWatch) {
    console.log('👀 Watch mode enabled');
    fs.watch(path.resolve('./src'), { recursive: true }, async () => {
        console.log('🔄 File changed — rebuilding...');
        await build();
    });
} else {
    build();
}

