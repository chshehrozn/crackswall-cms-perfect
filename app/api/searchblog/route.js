import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name') || '';
        const blogs = await query(
            `SELECT b.*, c.title as category_title FROM blogs b
       LEFT JOIN slip_categories c ON b.category_id=c.id
       WHERE b.title LIKE ? AND b.status='Active' AND b.is_deleted IS NULL
       ORDER BY b.id DESC LIMIT 20`,
            [`%${name}%`]
        );
        return NextResponse.json({ status: true, data: blogs, message: 'Blog fetched successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
