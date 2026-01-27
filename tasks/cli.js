import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import {fork} from 'node:child_process';
import {log} from './utils.js';

function printHelp() {
    console.log([
        'Volume booster build utility',
        '',
        'Usage: build [build parameters]',
        '',
        'To narrow down the list of build targets (for efficiency):',
        '  --chrome       MV2 for Chromium-based browsers (published to Chrome Web Store)',
        '  --chrome-mv3   MV3 for Chromium-based browsers (will replace MV2 version eventually)',
        '  --firefox      MV2 for Firefox (published to Mozilla Add-on store)',
        '  --thunderbird  Thunderbird',
        '',
    ].join('\n'));
}

const __filename = join(fileURLToPath(import.meta.url), '../build.js');

async function executeChildProcess(args) {
    const child = fork(__filename, args);
    process.on('SIGINT', () => {
        child.kill('SIGKILL');
        process.exit(130);
    });
    return new Promise((resolve, reject) => child.on('error', reject).on('close', resolve));
}

function validateArguments(args) {
    const validationErrors = [];
    // -----------------------------
    // Valid flags
    // -----------------------------
    const validFlags = [
        '--all',
        '--chrome',
        '--chrome-mv2',
        '--chrome-mv3',
        '--firefox',
        '--thunderbird',
        '--release',
        '--debug',
        '--watch',
        '--log-info',
        '--log-warn',
        '--test'
    ];
    const invalidFlags = args.filter((flag) => !validFlags.includes(flag));
    invalidFlags.forEach((flag) => validationErrors.push(`Invalid flag ${flag}`));

    return validationErrors;
}

async function run() {
    const args = process.argv.slice(3);
    
    const shouldPrintHelp = args.length === 0 || process.argv[2] !== 'build' || args.includes('-h') || args.includes('--help');
    if (shouldPrintHelp) {
      printHelp();
      process.exit(0);
    }

    const validationErrors = validateArguments(args);
    if (validationErrors.length > 0) {
        validationErrors.forEach(log.error);
        log.error('❌ No target platform specified.');
        printHelp();
        process.exit(130);
    }

    await executeChildProcess(args);

}
run();
