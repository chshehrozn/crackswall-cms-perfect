import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { readConfig } from '@/lib/config';

export async function POST(request) {
    try {
        const payload = await request.json();
        const config = readConfig();

        // Security check using the same admin secret
        if (config.security?.adminSecret && payload.secret !== config.security.adminSecret) {
            return NextResponse.json({ status: false, message: 'Unauthorized webhook access. Invalid secret.' }, { status: 401 });
        }

        const rows = Array.isArray(payload.data) ? payload.data : [payload.data];
        let synced = 0;

        for (const row of rows) {
            // Minimal validation
            if (!row.title || !row.slugs) continue;

            // Prevent SQL injection by using parameterized queries
            const existing = await query('SELECT id FROM blogs WHERE slugs = ? LIMIT 1', [row.slugs]);

            if (existing.length > 0) {
                // Update existing post
                await query(
                    `UPDATE blogs SET 
                        title = COALESCE(?, title),
                        description = COALESCE(?, description),
                        status = COALESCE(?, status),
                        category_id = COALESCE(?, category_id)
                     WHERE slugs = ?`,
                    [row.title, row.description, row.status, row.category_id, row.slugs]
                );
            } else {
                // Insert new post
                await query(
                    `INSERT INTO blogs (title, slugs, description, status, category_id, date, time) 
                     VALUES (?, ?, ?, ?, ?, CURDATE(), CURTIME())`,
                    [row.title, row.slugs, row.description, row.status || 'Active', row.category_id || 0]
                );
            }
            synced++;
        }

        return NextResponse.json({ status: true, message: `Successfully synced ${synced} posts from Google Sheets.` });
    } catch (e) {
        return NextResponse.json({ status: false, message: e.message }, { status: 500 });
    }
}
