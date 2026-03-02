import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const { action, ids } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ status: false, message: 'No items selected' }, { status: 400 });
        }

        const placeholders = ids.map(() => '?').join(',');

        switch (action) {
            case 'delete':
                await query(`UPDATE blogs SET is_deleted = 1 WHERE id IN (${placeholders})`, ids);
                return NextResponse.json({ status: true, message: `${ids.length} blog(s) moved to trash` });

            case 'activate':
                await query(`UPDATE blogs SET status = 'Active', is_deleted = NULL WHERE id IN (${placeholders})`, ids);
                return NextResponse.json({ status: true, message: `${ids.length} blog(s) restored / activated` });

            case 'deactivate':
                await query(`UPDATE blogs SET status = 'Inactive' WHERE id IN (${placeholders})`, ids);
                return NextResponse.json({ status: true, message: `${ids.length} blog(s) deactivated` });

            case 'permanent_delete':
                await query(`DELETE FROM blog_images WHERE blog_id IN (${placeholders})`, ids);
                await query(`DELETE FROM blogs WHERE id IN (${placeholders})`, ids);
                return NextResponse.json({ status: true, message: `${ids.length} blog(s) permanently deleted` });

            default:
                return NextResponse.json({ status: false, message: 'Invalid action' }, { status: 400 });
        }
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
