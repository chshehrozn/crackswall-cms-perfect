import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const languages = await query("SELECT locale, flag_icon, name FROM languages WHERE status = 'Active'");
        return NextResponse.json({ status: true, data: languages });
    } catch (err) {
        return NextResponse.json({ status: false, message: err.message }, { status: 500 });
    }
}
