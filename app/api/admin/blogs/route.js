import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('q') || '';
        const status = searchParams.get('status') || '';
        const category = searchParams.get('category') || '';
        const tab = searchParams.get('tab') || ''; // 'trash' or 'draft'
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '20');
        const offset = (page - 1) * perPage;

        let conditions = [];
        let params = [];

        // Handle trash vs active posts
        if (tab === 'trash') {
            conditions.push('b.is_deleted = 1');
        } else {
            conditions.push('(b.is_deleted IS NULL OR b.is_deleted = 0)');
        }

        if (search) {
            conditions.push('(b.title LIKE ? OR b.slugs LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status) {
            conditions.push('b.status = ?');
            params.push(status);
        }

        if (category) {
            conditions.push('b.category_id = ?');
            params.push(category);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const [blogs, [{ total }], parentCategories, statusCounts, trashCount] = await Promise.all([
            query(
                `SELECT b.id, b.title, b.slugs, b.status, b.soft_image, b.no_of_download, b.created_at, b.category_id,
                 c.title as cat_title, c.slug as cat_slug
                 FROM blogs b
                 LEFT JOIN slip_categories c ON b.category_id = c.id
                 ${where}
                 ORDER BY b.id DESC
                 LIMIT ${perPage} OFFSET ${offset}`,
                params
            ),
            query(
                `SELECT COUNT(*) as total FROM blogs b ${where}`,
                params
            ),
            // Only return parent categories (category_id = 0) for the filter
            query(`SELECT id, title, slug FROM slip_categories WHERE category_id = 0 ORDER BY title ASC`),
            // Count by status (non-deleted posts)
            query(`SELECT 
                COUNT(*) as all_count,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN status = 'Inactive' OR status = 'Draft' THEN 1 ELSE 0 END) as draft_count
                FROM blogs WHERE (is_deleted IS NULL OR is_deleted = 0)`),
            // Count trash
            query(`SELECT COUNT(*) as count FROM blogs WHERE is_deleted = 1`),
        ]);

        const totalPages = Math.ceil(total / perPage);

        return NextResponse.json({
            status: true,
            data: {
                blogs,
                total,
                page,
                perPage,
                totalPages,
                categories: parentCategories,
                counts: {
                    ...(statusCounts[0] || { all_count: 0, active_count: 0, draft_count: 0 }),
                    trash_count: trashCount[0]?.count || 0,
                },
            }
        });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
