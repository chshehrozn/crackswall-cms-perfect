import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { blog_id, reason } = body;

        if (!blog_id || !reason) {
            return NextResponse.json({ status: false, message: 'Missing required fields: blog_id or reason' }, { status: 400 });
        }

        // Insert into reported_links table
        const result = await query(
            'INSERT INTO reported_links (blog_id, reason, status, created_at) VALUES (?, ?, ?, NOW())',
            [blog_id, reason, 'pending']
        );

        if (result.insertId) {
            return NextResponse.json({ status: true, message: 'Link successfully reported.' });
        } else {
            return NextResponse.json({ status: false, message: 'Failed to submit report.' }, { status: 500 });
        }
    } catch (err) {
        console.error("Report Link API Error:", err);
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
