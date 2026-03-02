import { NextResponse } from 'next/server';
import { isInstalled } from '@/lib/config';

const SETUP_PATHS = ['/setup', '/api/setup'];
const ADMIN_PATHS = ['/admin'];
const AUTH_PATH = '/admin/login';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Always allow static files, auth API, public APIs, and setup paths
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin') && !pathname.startsWith('/api/setup') && !pathname.startsWith('/api/unlock'))
    ) {
        return NextResponse.next();
    }

    // "Installed" check: Requires API URL and Token cookie to be alive
    const installed = await isInstalled(request);
    const isSetupPath = pathname.startsWith('/setup') || pathname.startsWith('/api/setup');
    const isAuthorized = request.cookies.get('ADMIN_AUTHORIZED')?.value === 'true';

    // 1. If trying to see /admin, hide with 404 unless authorized. 
    // BUT allow /setup for anyone (security via the master token check later)
    if (pathname.startsWith('/admin')) {
        if (!isAuthorized && pathname !== '/api/unlock') {
            return new NextResponse(null, { status: 404 });
        }
    }

    // 2. Not installed (no API cookies) → must go to /setup
    if (!installed && !isSetupPath) {
        return NextResponse.redirect(new URL('/setup', request.url));
    }

    // 3. Already installed → skip /setup
    if (installed && isSetupPath && !pathname.startsWith('/api/setup')) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // 4. Protect /admin/* routes — require session token
    if (pathname.startsWith('/admin') && pathname !== AUTH_PATH) {
        const sessionToken =
            request.cookies.get('authjs.session-token')?.value ||
            request.cookies.get('__Secure-authjs.session-token')?.value;

        if (!sessionToken) {
            const url = request.nextUrl.clone();
            url.pathname = AUTH_PATH;
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|images|favicon.ico|uploads).*)'],
};
