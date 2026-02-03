import path from 'node:path';
import less from 'less';

import {getDestDir, absolutePath} from './paths.js';
import {readFile, writeFile, getConfig} from './utils.js';
import {createTask} from './task.js';


async function bundleCSSEntry(entry, isDebug, isCompress) {
    const src = absolutePath(entry);
    const srcDir = path.dirname(src);

    let input = await readFile(src);

    const output = await less.render(input, { 
        filename: src,
        paths: [srcDir], 
        math: 'always', 
        compress: isDebug? false: isCompress,
        sourceMap: {
            sourceMapFileInline: isDebug
        },
    });

    return output.css;
}

async function writeFiles(dest, platforms, isDebug, css) {
    for(const platform of platforms){
        const dir = getDestDir({isDebug, platform});
        await writeFile(`${dir}/${dest}`, css);
    }
}

const cssEntries = [
    {
        src: 'src/less/style.less',
        dest: 'ui/devtools/style.css',
    },
    {
        src: 'src/less/style.less',
        dest: 'ui/options/style.css',
    }
];

function getEntryFile(entry) {
    return absolutePath(entry.src);
}

export function createBundleCSSTask(){
    let currentWatchFiles;
    const getWatchFiles = () => {
        const watchFiles = new Set();
        cssEntries.forEach((entry) => {
            entry.watchFiles?.forEach((file) => watchFiles.add(file));
            const entryFile = getEntryFile(entry);
            if (!watchFiles.has(entryFile)) {
                watchFiles.add(entryFile);
            }
        });
        currentWatchFiles = Array.from(watchFiles);
        return currentWatchFiles;
    };
    const bundleCSS = async ({platforms, isDebug}) => {
        for(const platform of platforms){
            const config = await getConfig(platform);
            const cssConfig = config["less"];
            const isCompress = cssConfig.compress;
            // console.log(cssEntries)
            // output
            // {
            //     entry: {
            //         'src/less/style.less': 'data/interface/style.css',
            //         'src/less/options.less': 'data/options/options.css'
            //     }
            // }
            for (const [src, dest] of Object.entries(cssConfig.entry)) {
                const css = await bundleCSSEntry(src, isDebug, isCompress);
                await writeFiles(dest, [platform], isDebug, css);
            }

        }

    }
    const onChange = async (changedFiles, watcher, platforms) => {
        // const entries = cssEntries.filter((entry) => {
        //     const entryFile = getEntryFile(entry);
        //     return changedFiles.some((changed) => {
        //         return entry.watchFiles?.includes(changed) || changed === entryFile;
        //     });
        // });

        for (const entry of entries) {
            // const css = await bundleCSSEntry(entry, true);
            // await writeFiles(entry.dest, platforms, true, css);
        }

        const newWatchFiles = getWatchFiles();
        watcher.unwatch(
            currentWatchFiles.filter((oldFile) => !newWatchFiles.includes(oldFile))
        );
        watcher.add(
            newWatchFiles.filter((newFile) => currentWatchFiles.includes(newFile))
        );

        // console.log(platforms)
    }

    //  const onChange = async (changedFiles, watcher, platforms) => {





    //     reload.reload({type: reload.CSS});
    // };

    return createTask(
        'bundle CSS',
        bundleCSS,
    ).addWatcher(
        () => {
            currentWatchFiles = getWatchFiles();
            return currentWatchFiles;
        },onChange);
     
}

export default createBundleCSSTask();