import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { writeConfig } from '@/lib/config';

export async function POST(request) {
    try {
        const { db, storage, admin } = await request.json();

        // 1. Connect to the database
        const conn = await mysql.createConnection({
            host: db.host, port: parseInt(db.port),
            database: db.database, user: db.user, password: db.password,
        });

        // Ensure users table exists with the correct tinyint type column
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        email_verified_at TIMESTAMP NULL,
        password VARCHAR(255) NOT NULL,
        type TINYINT NOT NULL DEFAULT 0,
        remember_token VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        // 2. Create admin user — type: 1 = admin, 0 = regular user
        const hash = await bcrypt.hash(admin.password, 12);
        await conn.execute(
            'INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)',
            [admin.name, admin.email, hash, 1]
        );
        await conn.end();

        // 3. Write config.json
        writeConfig({
            installed: true,
            db: { host: db.host, port: parseInt(db.port), database: db.database, user: db.user, password: db.password },
            storage,
            site: { name: 'CracksWall CMS', logo: null },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Setup error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
