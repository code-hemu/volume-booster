import {accessSync, existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {absolutePath} from './paths.js';

const colors = Object.entries({
    gray: '\x1b[90m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
}).reduce((map, [key, value]) => Object.assign(map, {[key]: (text) => `${value}${text}\x1b[0m`}), {});

export function logWithTime(text) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const leftpad = (/** @type {number} */n) => String(n).padStart(2, '0');
    return console.log(`${colors.gray([hours, minutes, seconds].map(leftpad).join(':'))} ${text}`);
}

export const log = Object.assign((text) => logWithTime(text), {
    ok: (text) => logWithTime(colors.green(text)),
    warn: (text) => logWithTime(colors.yellow(text)),
    error: (text) => logWithTime(colors.red(text)),
});

export async function pathExists(dest) {
    try {
        accessSync(dest);
        return true;
    } catch (err) {
        return false;
    }
}

export async function mkDirIfMissing(dest) {
    const dir = path.dirname(dest);
    if (!(await pathExists(dir))) {
        await fs.mkdir(dir, {recursive: true});
    }
}

export async function readFile(src, encoding = 'utf8') {
    return await fs.readFile(src, encoding);
}

export async function writeFile(dest, content, encoding = 'utf8') {
    await mkDirIfMissing(dest);
    await fs.writeFile(dest, content, encoding);
}

export async function readJSON(path) {
    const file = await readFile(path);
    return JSON.parse(file);
}

export async function writeJSON(dest, content, space = 4) {
    const string = JSON.stringify(content, null, space);
    return await writeFile(dest, string);
}

export async function getConfig(platform) {
    const config = {};
    const targetConfigPath = path.resolve(`config/${platform}.js`);
    if (existsSync(targetConfigPath)) {
        const targetConfig = await import(
            pathToFileURL(targetConfigPath).href
        );
        Object.assign(config, targetConfig.default ?? targetConfig);
    }
    return config;
}

export async function getAllFiles(folderPath){
  const {globby} = await import('globby');
    return await globby(folderPath);
}

export async function removeFolder(dir) {
    if (await pathExists(dir)) {
        await fs.rm(dir, {recursive: true});
    }
}

export async function createFolder(dir) {
    if (!(await pathExists(dir))) {
        await fs.mkdir(dir, {recursive: true});
    }
}

export async function copyFile(src, dest) {
    await mkDirIfMissing(dest);
    await fs.copyFile(src, dest);
}

export async function fileExistsInConfig(config, absoluteFilePath) {
    const normalizedTarget = absolutePath(absoluteFilePath);
    for (const [dest, src] of Object.entries(config)) {
        for (const file of src) {
            const relativePath = absolutePath(file);
            // console.log(`Checking if ${relativePath} == ${normalizedTarget} or ${absoluteFilePath}`);
            if (relativePath == normalizedTarget || relativePath == absoluteFilePath) {
                return JSON.parse(`{"${dest}":["${file}"]}`);
            }
        }
    }
    return false;
}