import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const { slug } = resolvedParams;

        // Fetch page by slug and status = 'Active'
        const pages = await query(
            `SELECT * FROM pages WHERE slug = ? AND status = 'Active' LIMIT 1`,
            [`/${slug}`]
        );

        if (!pages || pages.length === 0) {
            // Also try without leading slash just in case
            const pagesNoSlash = await query(
                `SELECT * FROM pages WHERE slug = ? AND status = 'Active' LIMIT 1`,
                [`${slug}`]
            );

            if (!pagesNoSlash || pagesNoSlash.length === 0) {
                return NextResponse.json(
                    { status: false, message: 'Page not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                status: true,
                data: pagesNoSlash[0],
            });
        }

        return NextResponse.json({
            status: true,
            data: pages[0],
        });
    } catch (error) {
        return NextResponse.json(
            { status: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
