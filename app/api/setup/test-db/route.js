import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
    try {
        const { host, port, database, user, password } = await request.json();

        const conn = await mysql.createConnection({
            host, port: parseInt(port), database, user, password,
            connectTimeout: 5000,
        });
        await conn.end();

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}
