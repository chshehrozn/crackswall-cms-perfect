const fs = eval('require("fs")');
const path = eval('require("path")');
import { readThemeSync as originalReadThemeSync } from './theme';

const THEME_PATH = path.join(process.cwd(), 'theme.json');

export function readThemeSync() {
    try {
        if (!fs.existsSync(THEME_PATH)) {
            // Fallback to the one that doesn't use FS if we are somehow in a weird state
            return originalReadThemeSync();
        }
        return JSON.parse(fs.readFileSync(THEME_PATH, 'utf-8'));
    } catch (e) {
        return originalReadThemeSync();
    }
}

export function writeThemeSync(data) {
    try {
        fs.writeFileSync(THEME_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) { }
}
