import { getCmsConfig } from './config';

const DEFAULT_THEME = {
    site: {
        name: "CracksWall",
        tagline: "Full Version Software",
        metaDescription: "Download the latest full version software, games, and tools for free.",
        logo: "/images/zeezfaveicon.png",
        favicon: "/images/zeezfaveicon.png",
        primaryColor: "#9333ea",
        secondaryColor: "#7c3aed"
    },
    header: {
        backgroundColor: "#ffffff",
        textColor: "#2b373a",
        showNavTitle: true,
        sticky: true
    },
    footer: {
        backgroundColor: "#21282a",
        textColor: "#bbbbbb",
        copyrightText: "Copyright © {year} - All right reserved by SHEHROZPC"
    },
    productCard: {
        backgroundColor: "#ffffff",
        borderColor: "#dedede",
        showRating: true,
        titleColor: "#2b373a"
    },
    menu: {
        activeColor: "#9333ea",
        hoverColor: "#7c3aed",
        fontSize: "16px"
    }
};

export function readThemeSync() {
    if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') return DEFAULT_THEME;
    try {
        const fs = eval('require("fs")');
        const path = eval('require("path")');
        const THEME_PATH = path.join(process.cwd(), 'theme.json');
        if (!fs.existsSync(THEME_PATH)) return DEFAULT_THEME;
        return JSON.parse(fs.readFileSync(THEME_PATH, 'utf-8'));
    } catch { return DEFAULT_THEME; }
}

export async function readTheme() {
    const local = readThemeSync();

    // 1. Try to fetch from Backend if available (Proxy Mode)
    try {
        const { apiUrl, apiToken } = await getCmsConfig();
        if (apiUrl && apiToken && apiUrl.startsWith('http')) {
            const res = await fetch(`${apiUrl}/cms-settings?key=theme`, {
                headers: { 'X-CMS-MASTER-TOKEN': apiToken },
                next: { revalidate: 3600 }
            });
            const data = await res.json();
            if (data.status && data.data) {
                const remote = JSON.parse(data.data);
                // Deep merge or at least key merge
                return {
                    ...DEFAULT_THEME,
                    ...remote,
                    site: { ...DEFAULT_THEME.site, ...(remote.site || {}) },
                    header: { ...DEFAULT_THEME.header, ...(remote.header || {}) },
                    footer: { ...DEFAULT_THEME.footer, ...(remote.footer || {}) },
                    productCard: { ...DEFAULT_THEME.productCard, ...(remote.productCard || {}) },
                    menu: { ...DEFAULT_THEME.menu, ...(remote.menu || {}) }
                };
            }
        }
    } catch (e) {
        // console.error("Theme fetch error:", e);
    }

    return local;
}

export async function writeTheme(data) {
    // 1. Sync to Backend
    try {
        const { apiUrl, apiToken } = await getCmsConfig();
        if (apiUrl && apiToken && apiUrl.startsWith('http')) {
            await fetch(`${apiUrl}/cms-settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CMS-MASTER-TOKEN': apiToken
                },
                body: JSON.stringify({ key: 'theme', value: JSON.stringify(data) })
            });
        }
    } catch (e) { }

    // 2. Also save locally (for dev/VPS)
    if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
        try {
            const fs = eval('require("fs")');
            const path = eval('require("path")');
            const THEME_PATH = path.join(process.cwd(), 'theme.json');
            fs.writeFileSync(THEME_PATH, JSON.stringify(data, null, 2), 'utf-8');
        } catch (e) { }
    }
}
