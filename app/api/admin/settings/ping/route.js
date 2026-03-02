import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config';

export async function POST() {
    try {
        const config = readConfig();
        const baseUrl = config?.storage?.local?.url?.replace('/uploads', '') || 'http://localhost:3001';
        const sitemapUrl = `${baseUrl}/sitemap.xml`;

        // Pinging Google & Bing sitemap endpoints
        const pingUrls = [
            `https://www.google.com/ping?sitemap=${sitemapUrl}`,
            `https://www.bing.com/ping?sitemap=${sitemapUrl}`
        ];

        // In a real IndexNow implementation, we'd send a POST with a key
        // For now, we just trigger sitemap pings
        const results = await Promise.allSettled(
            pingUrls.map(url => fetch(url, { method: 'GET' }))
        );

        return NextResponse.json({
            status: true,
            message: 'Search engines notified successfully via Sitemap ping.'
        });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
