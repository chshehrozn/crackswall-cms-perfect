import { NextResponse } from 'next/server';
import { isInstalled } from '@/lib/config';

export function GET(req) {
    if (isInstalled()) {
        const res = NextResponse.redirect(new URL('/admin/login', req.url));
        // Restore the cookie so the Edge middleware knows the CMS is installed
        res.cookies.set('cms_installed', 'true', {
            path: '/',
            maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
            httpOnly: false
        });
        return res;
    }

    // If actually not installed, send to real setup page
    return NextResponse.redirect(new URL('/setup', req.url));
}
