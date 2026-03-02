import { NextResponse } from 'next/server';
import { readConfig, writeConfig } from '@/lib/config';
import { readTheme, writeTheme } from '@/lib/theme';

export async function GET() {
    try {
        const config = readConfig();
        const cmsEnv = await getCmsConfig();

        // If no local config AND no env vars, then we are truly not installed
        if (!config && (!cmsEnv.apiUrl || !cmsEnv.apiToken)) {
            return NextResponse.json({ status: false, message: 'Config not found' }, { status: 404 });
        }

        // Initialize with default or local config
        const safeConfig = config ? JSON.parse(JSON.stringify(config)) : {
            site: { name: 'CracksWall', tagline: '', metaDescription: '', frontendUrl: '' },
            db: null,
            storage: { type: 'local' },
            seo: { robotsTxt: '', sitemapEnabled: true },
            security: { adminSecret: '' }
        };

        if (safeConfig.db) safeConfig.db.password = '********';

        // Merge tagline and metaDescription from theme.json into the response
        const theme = await readTheme();
        safeConfig.site = {
            ...safeConfig.site,
            name: theme?.site?.name || safeConfig.site.name,
            tagline: theme?.site?.tagline || '',
            metaDescription: theme?.site?.metaDescription || '',
            frontendUrl: theme?.site?.frontendUrl || cmsEnv.frontendUrl || '',
        };

        return NextResponse.json({ status: true, data: safeConfig });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const newConfig = await request.json();
        const currentConfig = readConfig();

        // Merge settings (be careful not to overwrite password with asterisks)
        const updatedConfig = {
            ...currentConfig,
            site: { ...currentConfig.site, ...newConfig.site },
            storage: { ...currentConfig.storage, ...newConfig.storage },
            seo: { ...currentConfig.seo, ...newConfig.seo },
            security: { ...currentConfig.security, ...newConfig.security },
        };

        // If user provided a real password (not the masked one), update it
        if (newConfig.db) {
            updatedConfig.db = { ...currentConfig.db, ...newConfig.db };
            if (newConfig.db.password === '********') {
                updatedConfig.db.password = currentConfig.db.password;
            }
        }

        writeConfig(updatedConfig);

        // Sync site fields to theme.json so frontend + CMS sidebar stay in sync
        if (newConfig.site) {
            const theme = await readTheme();
            const { name, tagline, metaDescription, frontendUrl } = newConfig.site;
            if (name) theme.site.name = name;
            if (tagline !== undefined) theme.site.tagline = tagline;
            if (metaDescription !== undefined) theme.site.metaDescription = metaDescription;
            if (frontendUrl !== undefined) theme.site.frontendUrl = frontendUrl;
            await writeTheme(theme);
        }

        return NextResponse.json({ status: true, message: 'Settings updated successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
