import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';

let rootDir = dirname(createRequire(import.meta.url).resolve('../package.json'));

export const absolutePath = (path) => {
    return join(rootDir, path);
};
export function setRootDir(dir) {
    rootDir = dir;
}
export function getDestDir({isDebug, platform}) {
    const buildTypeDir = `build/${isDebug ? 'debug':'release'}`;
    return `${buildTypeDir}/${platform}`;
}
export default {
    getDestDir,
    rootDir,
    absolutePath,
    setRootDir,
};
