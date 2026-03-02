import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const cats = await query("SELECT * FROM slip_categories WHERE status='Active' AND category_id=0");
        for (const cat of cats) {
            cat.subcategories = await query(
                "SELECT * FROM slip_categories WHERE status='Active' AND category_id=?",
                [cat.id]
            );
        }
        return NextResponse.json({ status: true, data: cats, message: 'Category get successfully' });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
