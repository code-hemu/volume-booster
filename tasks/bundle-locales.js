import fs from 'node:fs/promises';
import path from 'node:path';

import {getDestDir, absolutePath} from './paths.js';
import {readFile, writeFile, getAllFiles} from './utils.js';
import {createTask} from './task.js';
import * as reload from './reload.js';

const srcLocalesDir = 'src/_locales';

async function writeFiles(data, fileName, {platforms, isDebug}){
    const locale = fileName.substring(0, fileName.lastIndexOf('.')).replace('-', '_');
    const getOutputPath = (dir) => `${dir}/_locales/${locale}/messages.json`;
    for (const platform of platforms) {
        const dir = getDestDir({isDebug, platform});
        await writeFile(getOutputPath(dir), data);
    }

}

async function localeFileToJson(filePath) {
    let file = await readFile(filePath);
    file = file.replace(/^#.*?$/gm, '');

    const messages = {};

    const regex = /@([a-z0-9_]+)/ig;
    let match;
    while ((match = regex.exec(file))) {
        const messageName = match[1];
        const messageStart = match.index + match[0].length;
        let messageEnd = file.indexOf('@', messageStart);
        if (messageEnd < 0) {
            messageEnd = file.length;
        }
        messages[messageName] = {
            message: file.substring(messageStart, messageEnd).trim(),
        };
    }

    return messages;
}

async function mergeLocale(localesDir, code) {
    let result = {};

    const walk = async (dir) => {
        const dirFiles = [];
        const dirDirs = [];
        const paths = await fs.readdir(dir);
        for (const path of paths) {
            const stat = await fs.stat(`${dir}/${path}`);
            if (stat.isDirectory()) {
                dirDirs.push(path);
            } else {
                dirFiles.push(path);
            }
        }
        const localeFiles = dirFiles.filter((f) => f.split('.').at(-2) === code);
        for (const localeFile of localeFiles) {
            const messages = await localeFileToJson(`${dir}/${localeFile}`);
            result = {...result, ...messages};
        }
        for (const folder of dirDirs) {
            await walk(`${dir}/${folder}`);
        }
    };

    await walk(localesDir);
    return JSON.stringify(result, null, 4);
}

async function bundleLocales(srcLocalesDir, {platforms, isDebug, logInfo}) {
    const absoluteSrcLocalesDir = absolutePath(srcLocalesDir);
    const list = await fs.readdir(absoluteSrcLocalesDir);
    for (const name of list) {
        if (!name.endsWith('.i18n')) {
            if (logInfo) log.info(`Skipping non-locale file ${name} in ${srcLocalesDir}.`);
            continue;
        }
        const code = (name.split('.').at(-2));
        const locale = await mergeLocale(absoluteSrcLocalesDir, code);
        const fileName = name.substring(name.lastIndexOf('/') + 1);
        await writeFiles(locale, fileName, {platforms, isDebug});
        if (logInfo) log.info(`Bundled locale ${code} for platforms: ${platforms.join(', ')}.`);
    }
}

export function createBundleLocalesTask(srcLocalesDir) {
    const onChange = async (changedFiles, watcher, platforms, isDebug) => {
        const localesSrcDir = absolutePath(srcLocalesDir);
        for (const file of changedFiles) {
            const fileName = file.substring(file.lastIndexOf(path.sep) + 1);
            const code = (fileName.split('.').at(-2));
            const locale = await mergeLocale(localesSrcDir, code);
            await writeFiles(locale, fileName, {platforms, isDebug});
        }
        // reload.reload({type: reload.FULL});
    }
    return createTask(
        'bundle locales',
        (options) => bundleLocales(srcLocalesDir, options),
    ).addWatcher(
        async () => {
            const currentWatchFiles = await getAllFiles(srcLocalesDir);
            return currentWatchFiles;
        },
        onChange,
    );
} 

export default createBundleLocalesTask(srcLocalesDir);