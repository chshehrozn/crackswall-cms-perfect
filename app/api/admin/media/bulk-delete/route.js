import { NextResponse } from 'next/server';
import { deleteFile } from '@/lib/storage';

export async function POST(request) {
    try {
        const { filenames } = await request.json();
        if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
            return NextResponse.json({ success: false, error: 'No files specified' }, { status: 400 });
        }

        let deleted = 0;
        for (const name of filenames) {
            try {
                deleteFile(name);
                deleted++;
            } catch (e) { /* skip */ }
        }

        return NextResponse.json({ success: true, deleted, message: `${deleted} file(s) deleted` });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
