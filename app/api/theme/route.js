import { readConfig } from '@/lib/config-server';
import { readTheme } from '@/lib/theme';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const theme = await readTheme();
        const config = readConfig();

        return NextResponse.json({
            ...theme,
            seo: config?.seo || {}
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
