import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        const cat = await queryOne(
            "SELECT * FROM slip_categories WHERE status='Active' AND slug=?",
            [slug]
        );
        if (!cat) return NextResponse.json({ status: false }, { status: 404 });
        const rawBlogs = await query(
            `SELECT b.*, 
             c.title as cat_title, c.slug as cat_slug,
             s.title as sub_title, s.slug as sub_slug
       FROM blogs b
       LEFT JOIN slip_categories c ON b.category_id=c.id
       LEFT JOIN slip_categories s ON b.subcategory_id=s.id
       WHERE b.subcategory_id=? AND b.status='Active' AND b.is_deleted IS NULL
       ORDER BY b.id DESC LIMIT 20`,
            [cat.id]
        );

        const blogs = rawBlogs.map(b => ({
            ...b,
            category: b.category_id ? { id: b.category_id, title: b.cat_title, slug: b.cat_slug } : null,
            subcategory: b.subcategory_id ? { id: b.subcategory_id, title: b.sub_title, slug: b.sub_slug } : null
        }));

        return NextResponse.json({ status: true, data: { data: blogs }, category: cat, message: 'Category and blog get successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
