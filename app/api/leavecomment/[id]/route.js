import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const { name, email, comment } = await request.json();
        await query(
            'INSERT INTO comments (blog_id, name, email, comment) VALUES (?, ?, ?, ?)',
            [parseInt(id), name, email, comment]
        );
        return NextResponse.json({ status: true, message: 'Comment saved successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
