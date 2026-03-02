import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function POST(request, { params }) {
    try {
        const { slug } = await params;
        const { rating } = await request.json();
        const blog = await queryOne('SELECT * FROM blogs WHERE slugs=?', [slug]);
        if (!blog) return NextResponse.json({ status: false }, { status: 404 });
        const oldRating = parseFloat(blog.rating_value || 0);
        const totalRating = parseInt(blog.review_count || 0);
        const newCount = totalRating + 1;
        const newAvg = ((totalRating * oldRating) + parseFloat(rating)) / newCount;
        await query(
            'UPDATE blogs SET review_count=?, rating_value=? WHERE id=?',
            [String(newCount), String(newAvg.toFixed(2)), blog.id]
        );
        return NextResponse.json({ status: true, message: 'Rating added successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
