import { NextResponse } from 'next/server';
import { readTheme, writeTheme } from '@/lib/theme';
import { readConfig, writeConfig } from '@/lib/config-server';

export async function GET() {
    try {
        const theme = await readTheme();
        return NextResponse.json({ status: true, data: theme });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const newTheme = await request.json();
        // In a real app, you might want to validate the schema here
        await writeTheme(newTheme);

        // Sync site name to config.json so Settings page stays in sync
        if (newTheme.site?.name) {
            const config = readConfig();
            config.site = { ...config.site, name: newTheme.site.name };
            writeConfig(config);
        }

        return NextResponse.json({ status: true, message: 'Theme settings updated successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
