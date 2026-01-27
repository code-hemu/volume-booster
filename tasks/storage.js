import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Storage {
    constructor(filename = 'storage.json') {
        this.file = path.join(__dirname, filename);

        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, JSON.stringify({}));
        }
    }

    get(key) {
        const data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        return data[key];
    }

    set(key, value) {
        const data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        data[key] = value;
        fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
    }
}

export const localstorage = new Storage();