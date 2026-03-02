import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        let category = await queryOne(
            "SELECT * FROM slip_categories WHERE status='Active' AND slug=?",
            [slug]
        );
        // Fallback: Check if slug is actually an ID
        if (!category && !isNaN(slug)) {
            category = await queryOne(
                "SELECT * FROM slip_categories WHERE status='Active' AND id=?",
                [slug]
            );
        }

        if (!category) {
            return NextResponse.json({ status: false, message: 'Category not found' }, { status: 404 });
        }
        const subcategories = await query(
            "SELECT * FROM slip_categories WHERE status='Active' AND category_id=?",
            [category.id]
        );
        return NextResponse.json({
            status: true,
            data: category,
            subcategory: subcategories,
            message: 'Category and blog get successfully'
        });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
