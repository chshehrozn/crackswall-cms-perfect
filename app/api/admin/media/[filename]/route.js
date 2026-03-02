import { NextResponse } from 'next/server';
import { deleteFile } from '@/lib/storage';

export async function DELETE(request, { params }) {
    try {
        deleteFile(decodeURIComponent(params.filename));
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
