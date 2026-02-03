import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import {createTask} from './task.js';
import {log} from './utils.js';

export function createFolderTask() {
    const createFolder = async ({platforms, isRelease, logInfo}) => {
        process.env.NODE_ENV = isRelease ? 'production' : 'development';
        for(const platform of platforms){
            const distDir = path.resolve(`build/${isRelease ? 'release' : 'debug'}` , platform);

            if (!fs.existsSync(distDir)) {
                fs.mkdirSync(distDir, { recursive: true });
                logInfo ? log(`Folder Create: ${distDir}`) : null;
            }

            for (const file of fs.readdirSync(distDir)) {
                fs.rmSync(path.join(distDir, file), { recursive: true, force: true });
                logInfo ? log(`File Remove: ${file}`) : null;
            }
        }
    };
    return createTask(
        'Environment Create',
        createFolder,
    );
}

export default createFolderTask();