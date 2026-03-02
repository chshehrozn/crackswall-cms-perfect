import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const blogs = await query(
            `SELECT b.*, 
                    c.id as cat_id, c.title as cat_title, c.slug as cat_slug, 
                    s.id as sub_id, s.title as sub_title, s.slug as sub_slug
             FROM blogs b
             LEFT JOIN slip_categories c ON b.category_id = c.id
             LEFT JOIN slip_categories s ON b.subcategory_id = s.id
             WHERE b.status = 'Active' AND b.is_deleted IS NULL
             ORDER BY b.id DESC LIMIT 12`
        );

        const formattedBlogs = blogs.map(b => ({
            ...b,
            category: b.cat_id ? { id: b.cat_id, title: b.cat_title, slug: b.cat_slug } : null,
            subcategory: b.sub_id ? { id: b.sub_id, title: b.sub_title, slug: b.sub_slug } : null
        }));

        const responseData = {
            current_page: 1,
            data: formattedBlogs,
            to: formattedBlogs.length,
            total: formattedBlogs.length
        };

        return NextResponse.json({ status: true, data: responseData, message: 'Blogs got successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
