import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { apiUrl, apiToken, frontendUrl } = await request.json();

        if (!apiUrl || !apiToken) {
            return NextResponse.json({ success: false, error: 'Missing API URL or Token' }, { status: 400 });
        }

        // Normalize URLs
        let cleanApiUrl = apiUrl.trim().replace(/\/$/, '');
        if (!cleanApiUrl.startsWith('http')) cleanApiUrl = `https://${cleanApiUrl}`;

        let cleanFeUrl = (frontendUrl || '').trim().replace(/\/$/, '');
        if (cleanFeUrl && !cleanFeUrl.startsWith('http')) cleanFeUrl = `https://${cleanFeUrl}`;

        // 1. Verify the token with the backend
        const verifyRes = await fetch(`${cleanApiUrl}/master-token-verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CMS-MASTER-TOKEN': apiToken.trim()
            }
        });

        if (!verifyRes.ok) {
            let errorMsg = 'Invalid Master Token or Backend URL';
            const text = await verifyRes.text();

            try {
                const errData = JSON.parse(text);
                errorMsg = errData.message || errorMsg;
            } catch (e) {
                // If it's HTML or some other non-JSON, show a snippet
                errorMsg = `Backend returned non-JSON [${verifyRes.status}]: ${text.substring(0, 100)}...`;
            }
            return NextResponse.json({ success: false, error: errorMsg }, { status: 401 });
        }

        // 2. Sync Settings to Backend (Persistence)
        try {
            await fetch(`${cleanApiUrl}/cms-settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CMS-MASTER-TOKEN': apiToken.trim()
                },
                body: JSON.stringify({
                    frontendUrl: cleanFeUrl,
                    installed_at: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error('Failed to sync settings to backend:', e);
        }

        // 3. Set the configuration cookies
        const response = NextResponse.json({ success: true, message: 'Connected to Backend successfully!' });

        // Use long-lived cookies to persist configuration on Vercel
        const cookieOptions = {
            path: '/',
            maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
            httpOnly: false, // Allow client-side access if needed
            sameSite: 'lax',
        };

        response.cookies.set('cms_api_url', cleanApiUrl, cookieOptions);
        response.cookies.set('cms_api_token', apiToken, cookieOptions);
        if (cleanFeUrl) {
            response.cookies.set('cms_frontend_url', cleanFeUrl, cookieOptions);
        }
        response.cookies.set('cms_installed', 'true', cookieOptions);

        return response;
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Connection failed: ' + err.message }, { status: 500 });
    }
}
