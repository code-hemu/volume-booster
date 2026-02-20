import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import {fork} from 'node:child_process';
import {log} from './utils.js';

function printHelp() {
    console.log([
        'Volume booster build utility',
        'Usage: npm run build -- [options]',
        '',
        'To narrow down the list of build targets (for efficiency):',
        '  --all          Build for all platforms',
        '  --chrome-mv3   MV3 for Chromium-based browsers',
        '  --naver        Naver Whale',
        '',
        'Other parameters:',
        '  --release       Build release version (default)',
        '  --debug         Build debug version',
        '  --watch         Watch for changes and rebuild automatically',
        '  --log-info      Log info messages',
        '  --log-warn      Log warning messages',
        '  --test          Build test version (for testing in development environment)',
        '  --version=1.2.3 Append version to output file name (e.g. volume-booster-chrome-1.2.3.zip)',
        '  -h, --help      Show this help message',
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
    const validFlags = [
        '--all',
        '--chrome',
        '--chrome-mv2',
        '--chrome-mv3',
        '--naver',
        '--release',
        '--debug',
        '--watch',
        '--log-info',
        '--log-warn',
        '--test',
        '--version=',
        '--help',
        '-h'
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
