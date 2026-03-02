const fs = eval('require("fs")');
const path = eval('require("path")');

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export function readConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return null;
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch { return null; }
}

export function writeConfig(data) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) { }
}
