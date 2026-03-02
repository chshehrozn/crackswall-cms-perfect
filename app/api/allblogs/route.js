import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const cats = await query("SELECT * FROM slip_categories WHERE status='Active' AND category_id=0");
        for (const cat of cats) {
            const innerBlogs = await query(
                `SELECT b.*, 
                 c.title as cat_title, c.slug as cat_slug, 
                 s.title as subcategory_title, s.slug as sub_slug
         FROM blogs b
         LEFT JOIN slip_categories c ON b.category_id=c.id
         LEFT JOIN slip_categories s ON b.subcategory_id=s.id
         WHERE b.category_id=? AND b.status='Active' AND b.is_deleted IS NULL
         ORDER BY b.id DESC LIMIT 12`,
                [cat.id]
            );

            const formattedBlogs = innerBlogs.map(b => ({
                ...b,
                category: b.category_id ? { id: b.category_id, title: b.cat_title, slug: b.cat_slug } : null,
                subcategory: b.subcategory_id ? { id: b.subcategory_id, title: b.subcategory_title, slug: b.sub_slug } : null
            }));

            // Emulate Laravel's paginate(12) serialization format that the frontend maps over
            cat.blogs = {
                current_page: 1,
                data: formattedBlogs,
                to: formattedBlogs.length,
                total: formattedBlogs.length
            };
        }
        return NextResponse.json({ status: true, data: cats, message: 'Category get successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
