import {exec} from 'node:child_process';
import {accessSync} from 'node:fs';
import fs from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';

import {localstorage} from './storage.js';

// -----------------------------
// Logging
// -----------------------------
const args = localstorage.get('args');

const logInfo = args.logInfo ? args.logInfo : false;
const logWarn = args.logWarn ? args.logWarn : false;

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
    ok: (text) => logInfo ? logWithTime(colors.green(text)): null,
    warn: (text) => logWarn ? logWithTime(colors.yellow(text)): null,
    error: (text) => logWithTime(colors.red(text)),
});

export async function readFile(src, encoding = 'utf8') {
    return await fs.readFile(src, encoding);
}

export async function writeFile(dest, content, encoding = 'utf8') {
    await mkDirIfMissing(dest);
    await fs.writeFile(dest, content, encoding);
}

