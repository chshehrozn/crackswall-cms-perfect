import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config-server';

export async function GET() {
    const config = readConfig();
    const robotsTxt = config?.seo?.robotsTxt || "User-agent: *\nAllow: /";

    return new Response(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
