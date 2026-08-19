import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
const CONFIG_DIR = path.join(os.homedir(), '.webbuilder');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
export const config = {
    ensureConfigDir() {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
    },
    get(key) {
        this.ensureConfigDir();
        if (!fs.existsSync(CONFIG_FILE)) {
            return undefined;
        }
        try {
            const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
            return data[key];
        }
        catch {
            return undefined;
        }
    },
    set(key, value) {
        this.ensureConfigDir();
        let data = {};
        if (fs.existsSync(CONFIG_FILE)) {
            try {
                data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
            }
            catch {
                data = {};
            }
        }
        data[key] = value;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    },
    getAll() {
        this.ensureConfigDir();
        if (!fs.existsSync(CONFIG_FILE)) {
            return {};
        }
        try {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        }
        catch {
            return {};
        }
    },
    delete(key) {
        this.ensureConfigDir();
        if (!fs.existsSync(CONFIG_FILE)) {
            return;
        }
        try {
            const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
            delete data[key];
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
        }
        catch {
            // ignore
        }
    },
    reset() {
        this.ensureConfigDir();
        if (fs.existsSync(CONFIG_FILE)) {
            fs.unlinkSync(CONFIG_FILE);
        }
    },
    getConfigPath() {
        return CONFIG_FILE;
    },
};
//# sourceMappingURL=config.js.map