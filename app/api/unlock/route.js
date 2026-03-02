import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function GET(request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1';
        await limiter.check(5, ip); // Max 5 unlock attempts per minute per IP
    } catch {
        return new Response('Too many requests. Please try again later.', { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    const config = readConfig();
    const secret = config?.security?.adminSecret || 'shehroz_secret';

    if (key === secret) {
        const reset = searchParams.get('reset') === 'true';
        const response = NextResponse.redirect(new URL(reset ? '/setup' : '/admin', request.url));

        // Set a long-lived cookie (30 days) to authorize this browser
        response.cookies.set('ADMIN_AUTHORIZED', 'true', {
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        // If reset is requested, clear the installation state cookies
        if (reset) {
            response.cookies.set('cms_api_url', '', { path: '/', maxAge: 0 });
            response.cookies.set('cms_api_token', '', { path: '/', maxAge: 0 });
            response.cookies.set('cms_installed', '', { path: '/', maxAge: 0 });
        }

        return response;
    }

    return new Response('Invalid security key', { status: 403 });
}
