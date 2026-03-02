import { cookies } from 'next/headers';

export async function isInstalled() {
    try {
        // 1. Check for Environment Variables (Vercel Prod - Zero Config)
        if (process.env.CMS_API_URL && process.env.CMS_API_TOKEN) return true;

        // 2. Check for remote API config (Server-side cookies)
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const apiUrl = cookieStore.get('cms_api_url')?.value;
        const apiToken = cookieStore.get('cms_api_token')?.value;
        if (apiUrl && apiToken) return true;
    } catch (e) { }

    return false;
}

export async function getCmsConfig() {
    try {
        // Priority 1: Environment Variables
        if (process.env.CMS_API_URL && process.env.CMS_API_TOKEN) {
            return {
                apiUrl: process.env.CMS_API_URL,
                apiToken: process.env.CMS_API_TOKEN,
                frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || ''
            };
        }

        // Priority 2: Cookies (Server Side)
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        return {
            apiUrl: cookieStore.get('cms_api_url')?.value || '',
            apiToken: cookieStore.get('cms_api_token')?.value || '',
            frontendUrl: cookieStore.get('cms_frontend_url')?.value || ''
        };
    } catch (e) {
        return { apiUrl: '', apiToken: '', frontendUrl: '' };
    }
}
