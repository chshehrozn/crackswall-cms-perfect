import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        const blog = await queryOne(
            `SELECT b.*, 
             c.title as cat_title, c.slug as cat_slug, 
             s.title as subcategory_title, s.slug as sub_slug
       FROM blogs b
       LEFT JOIN slip_categories c ON b.category_id = c.id
       LEFT JOIN slip_categories s ON b.subcategory_id = s.id
       WHERE b.slugs = ?`,
            [slug]
        );
        if (!blog) return NextResponse.json({ status: false, message: 'Not found' }, { status: 404 });

        blog.category = blog.category_id ? { id: blog.category_id, title: blog.cat_title, slug: blog.cat_slug } : null;
        blog.subcategory = blog.subcategory_id ? { id: blog.subcategory_id, title: blog.subcategory_title, slug: blog.sub_slug } : null;

        const [comments, images] = await Promise.all([
            query('SELECT * FROM comments WHERE blog_id = ?', [blog.id]),
            query('SELECT * FROM blog_images WHERE blog_id = ?', [blog.id]),
        ]);
        blog.comments = comments;
        blog.images = images;
        return NextResponse.json({ status: true, data: blog, message: 'Blog get successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
