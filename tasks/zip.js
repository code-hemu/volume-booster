import {exec} from 'node:child_process';
import fs from 'node:fs';

import yazl from 'yazl';

import {getDestDir} from './paths.js';
import {createTask} from './task.js';

import {getAllFiles} from './utils.js';

function archiveFiles({files, dest, cwd, date, mode}) {
    return new Promise((resolve) => {
        const archive = new yazl.ZipFile();
        files.sort();
        files.forEach((file) => archive.addFile(
            file,
            file.startsWith(`${cwd}/`) ? file.substring(cwd.length + 1) : file,
            {mtime: date, mode}
        ));
        const writeStream = fs.createWriteStream(dest);
        archive.outputStream.pipe(writeStream).on('close', resolve);
        archive.end();
    });
}

async function getLastCommitTime() {
    return new Promise((resolve) =>
    exec('git log -1 --format=%ct', (_, stdout) => resolve(new Date(
        Math.max(0, Number(stdout) + (new Date()).getTimezoneOffset() * 60) * 1000
    ))));
}

async function archiveDirectory({dir, dest, date, mode}) {
    const files = await getAllFiles(`${dir}/**/*.*`);
    await archiveFiles({files, dest, cwd: dir, date, mode});
}


async function zip({platforms, isDebug, version}) {
    if (isDebug) {
        throw new Error('zip task does not support debug builds');
    }
    version = version ? `-${version}` : '';
    const releaseDir = 'build/release';
    const promises = [];
    const date = await getLastCommitTime();
    const xpiPlatforms = [];
    for (const platform of platforms) {
        const format = xpiPlatforms.includes(platform) ? 'xpi' : 'zip';
        const dest = `${releaseDir}/volume-booster-${platform}${version}.${format}`;
        promises.push(archiveDirectory({
            dir: getDestDir({isDebug, platform}),
            dest,
            date,
            mode: 0o644
        }));
        await Promise.all(promises);
    }
}

const zipTask = createTask('zip', zip,);
export default zipTask;