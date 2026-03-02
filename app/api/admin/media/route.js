export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const apiUrl = cookieStore.get('cms_api_url')?.value;
        const apiToken = cookieStore.get('cms_api_token')?.value;

        if (!apiUrl || !apiToken) {
            return NextResponse.json({ files: [], total: 0 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('q') || '';
        const sort = searchParams.get('sort') || 'newest';

        const res = await fetch(`${apiUrl}/cms-media`, {
            headers: {
                'X-CMS-MASTER-TOKEN': apiToken
            }
        });

        const data = await res.json();
        let allFiles = data.files || [];

        // Search filter (Backend does listing, but CMS can secondary-filter or we can pass params)
        if (search) {
            const q = search.toLowerCase();
            allFiles = allFiles.filter(f => f.name.toLowerCase().includes(q));
        }

        // Sort
        if (sort === 'newest') allFiles.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        else if (sort === 'oldest') allFiles.sort((a, b) => new Date(a.modified) - new Date(b.modified));
        else if (sort === 'name') allFiles.sort((a, b) => a.name.localeCompare(b.name));
        else if (sort === 'size') allFiles.sort((a, b) => b.size - a.size);

        return NextResponse.json({ files: allFiles, total: allFiles.length });
    } catch (err) {
        return NextResponse.json({ files: [], total: 0, error: err.message }, { status: 500 });
    }
}
