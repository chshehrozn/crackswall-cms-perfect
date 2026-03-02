import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const apiUrl = cookieStore.get('cms_api_url')?.value;
        const apiToken = cookieStore.get('cms_api_token')?.value;

        if (!apiUrl || !apiToken) {
            return NextResponse.json({ success: false, error: 'CMS not connected to Backend' }, { status: 401 });
        }

        const formData = await request.formData();

        // Proxy the entire formData to the backend
        const res = await fetch(`${apiUrl}/cms-upload`, {
            method: 'POST',
            headers: {
                'X-CMS-MASTER-TOKEN': apiToken
            },
            body: formData
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
