import fs from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {readFile, writeFile, httpsRequest, timeout} from './utils.js';


const LOCALES_ROOT = 'src/_locales';

function toMessageId(message) {
  if (typeof message !== 'string') return '';

  return message
    .trim()
    .split(/\s+/)      // split by any whitespace
    .slice(0, 3)       // only first 3 words
    .map(word =>
      word
        .replace(/[^\w]/g, '') // remove special characters
        .toLowerCase()
    )
    .filter(Boolean)   // remove empty results
    .join('_');
}

async function getSupportedLocales() {
    const fileList = await fs.readdir(LOCALES_ROOT);

    const locales = [];

    for (const file of fileList) {
        if (file.endsWith('.i18n')) {
            const locale = file.substring(0, file.lastIndexOf('.i18n'));
            locales.push(locale);
        }
    }

    return locales;
}

function stringifyLocale(messages) {
    const lines = [];
    messages.forEach((message, id) => {
        lines.push(`@${id}`);
        const hasDoubleNewLines = /\n\n/.test(message);
        message.split('\n')
            .filter((line) => line.trim())
            .forEach((line, index, filtered) => {
                lines.push(line);
                if (hasDoubleNewLines && index < filtered.length - 1) {
                    lines.push('');
                }
            });
        lines.push('');
    });
    return lines.join('\n');
}

function parseLocale(content) {
    const messages = new Map();
    const lines = content.split('\n');
    let id = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('@')) {
            id = line.substring(1);
        } else if (line.startsWith('#')) {
            // Ignore
        } else if (messages.has(id)) {
            const message = messages.get(id);
            messages.set(id, `${message}\n${line}`);
        } else {
            messages.set(id, line);
        }
    }
    messages.forEach((value, id) => {
        messages.set(id, value.trim());
    });
    return messages;
}

async function translate(text, lang) {
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.search = (new URLSearchParams({
        client: 'gtx',
        sl: 'en-US',
        tl: lang,
        dt: 't',
        dj: '1',
        q: text,
    })).toString();
    const response = await httpsRequest(url.toString());
    const translation = JSON.parse(response.text());
    return translation.sentences.map((s) => s.trans).join('\n').replaceAll(/\n+/g, '\n');
}

async function deleteMessage(messageId) {
  const supportedLocales = await getSupportedLocales();

  if (!messageId || !messageId.trim()) {
    console.log('⚠ Message key cannot be empty.');
    return;
  }

  const id = messageId.trim();
  let foundAnywhere = false;

  for (const locale of supportedLocales) {
    const locFile = `${LOCALES_ROOT}/${locale}.i18n`;
    const locContent = await readFile(locFile);
    const locMessages = parseLocale(locContent);

    if (!locMessages.has(id)) {
      continue;
    }

    locMessages.delete(id);
    const output = stringifyLocale(locMessages);
    await writeFile(locFile, output);

    console.log(`✔ Removed from ${locale}.i18n`);
    foundAnywhere = true;
  }

  if (!foundAnywhere) {
    console.log('⚠ Message key not found in any locale.');
  } else {
    console.log('🗑 Deletion completed.');
  }
}


async function translateEnMessage(message, customId) {
  console.log(`Translating message: ${message}`);

  const supportedLocales = await getSupportedLocales();
  const messageId = customId && customId.trim()
    ? customId.trim()
    : toMessageId(message);

  // 1️⃣ Update English first
  const enFile = `${LOCALES_ROOT}/en.i18n`;
  const enContent = await readFile(enFile);
  const enMessages = parseLocale(enContent);

  if (!enMessages.has(messageId)) {
    enMessages.set(messageId, message);
    const output = stringifyLocale(enMessages);
    await writeFile(enFile, output);
    console.log(`en: ${message}`);
  } else {
    console.log('Message already exists in en.i18n');
  }

  // 2️⃣ Translate other locales
  for (const locale of supportedLocales) {
    if (locale === 'en') continue;

    await timeout(1000);

    const locFile = `${LOCALES_ROOT}/${locale}.i18n`;
    const locContent = await readFile(locFile);
    const locMessages = parseLocale(locContent);

    if (locMessages.has(messageId)) {
      console.log(`Already exists in: ${locFile}`);
      continue;
    }

    const translated = await translate(message, locale);
    locMessages.set(messageId, translated);

    const output = stringifyLocale(locMessages);
    await writeFile(locFile, output);

    console.log(`${locale}: ${translated}`);
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      console.log('\n=== Message Manager ===');
      console.log('[1] Add new message');
      console.log('[2] Delete message');
      console.log('[0] Exit');

      const choice = (await rl.question('Select option: '))
        .trim()
        .toLowerCase();

      switch (choice) {
        case '1': {
          const newMessage = (await rl.question('Enter new message: '))
            .trim();

          if (!newMessage) {
            console.log('⚠ Message cannot be empty.');
            break;
          }

          const newMessageId = (await rl.question(
            'Enter new message key (leave empty for auto-generation): '
          )).trim();

          await translateEnMessage(
            newMessage,
            newMessageId || undefined
          );

          console.log('✔ Message processed successfully.');
          break;
        }

        case '2': {
            const messageId = (await rl.question(
                'Enter message key to delete: '
            )).trim();

            if (!messageId) {
                console.log('⚠ Message key cannot be empty.');
                break;
            }

            const confirm = (await rl.question(
                `Are you sure you want to delete "${messageId}" from all locales? (y/n): `
            ))
                .trim()
                .toLowerCase();

            if (confirm !== 'y') {
                console.log('Deletion cancelled.');
                break;
            }

            await deleteMessage(messageId);
            break;
        }

        case '0':
        case 'exit': {
          console.log('Exiting...');
          return;
        }

        default: {
          console.log('Invalid selection. Please try again.');
        }
      }
    }
  } finally {
    rl.close();
  }
}main();