import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        const blog = await queryOne('SELECT * FROM blogs WHERE slugs=? LIMIT 1', [slug]);
        if (!blog) return NextResponse.json({ status: false }, { status: 404 });
        await query('UPDATE blogs SET no_of_download = no_of_download + 1 WHERE id=?', [blog.id]);
        return NextResponse.json({ status: true, message: 'Download added successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
