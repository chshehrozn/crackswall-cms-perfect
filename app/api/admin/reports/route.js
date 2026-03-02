import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const reports = await query(`
            SELECT r.*, b.title as blog_title, b.slugs as blog_slug, b.software_version
            FROM reported_links r
            LEFT JOIN blogs b ON r.blog_id = b.id
            ORDER BY r.created_at DESC
        `);
        return NextResponse.json({ status: true, data: reports });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ status: false, message: 'ID required' }, { status: 400 });

        await query('DELETE FROM reported_links WHERE id = ?', [id]);
        return NextResponse.json({ status: true, message: 'Report deleted successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
