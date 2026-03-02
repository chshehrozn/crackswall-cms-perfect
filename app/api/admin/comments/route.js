import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const comments = await query(`
            SELECT c.*, b.title as blog_title 
            FROM comments c 
            LEFT JOIN blogs b ON c.blog_id = b.id 
            ORDER BY c.id DESC
        `);
        return NextResponse.json({ status: true, data: comments });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ status: false, message: 'ID required' }, { status: 400 });

        await query('DELETE FROM comments WHERE id = ?', [id]);
        return NextResponse.json({ status: true, message: 'Comment deleted successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
