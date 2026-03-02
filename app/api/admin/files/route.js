import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
    const pin = request.headers.get('x-admin-pin');
    const config = readConfig();
    const adminPin = config?.security?.adminPin || '0000';

    if (!pin || pin !== adminPin) {
        return NextResponse.json({ status: false, message: 'Access Denied: Invalid Master PIN.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reqPath = searchParams.get('path') || '';

    // Security: Only allow paths within process.cwd()
    const basePath = process.cwd();
    const targetPath = path.join(basePath, reqPath);

    // Basic directory traversal protection
    if (!targetPath.startsWith(basePath)) {
        return NextResponse.json({ status: false, message: 'Invalid path' }, { status: 403 });
    }

    try {
        const stats = await fs.stat(targetPath);
        if (stats.isDirectory()) {
            const items = await fs.readdir(targetPath, { withFileTypes: true });

            // Format for file explorer
            const files = items
                .filter(i => !['.git', 'node_modules', '.next'].includes(i.name))
                .map(item => ({
                    name: item.name,
                    isDirectory: item.isDirectory(),
                    path: path.posix.join(reqPath.replace(/\\/g, '/'), item.name) // Ensure forward slashes
                }));

            // Sort: directories first
            files.sort((a, b) => {
                if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                return a.isDirectory ? -1 : 1;
            });

            return NextResponse.json({ status: true, isDirectory: true, files });
        } else {
            // It's a file
            const content = await fs.readFile(targetPath, 'utf-8');
            return NextResponse.json({ status: true, isDirectory: false, content });
        }
    } catch (e) {
        return NextResponse.json({ status: false, message: e.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const pin = request.headers.get('x-admin-pin');
        const config = readConfig();
        const adminPin = config?.security?.adminPin || '0000';

        if (!pin || pin !== adminPin) {
            return NextResponse.json({ status: false, message: 'Access Denied: Invalid Master PIN.' }, { status: 403 });
        }

        const { path: reqPath, content } = await request.json();
        const basePath = process.cwd();
        const targetPath = path.join(basePath, reqPath);

        if (!targetPath.startsWith(basePath)) {
            return NextResponse.json({ status: false, message: 'Invalid path' }, { status: 403 });
        }

        await fs.writeFile(targetPath, content, 'utf-8');
        return NextResponse.json({ status: true, message: 'File saved successfully' });
    } catch (e) {
        return NextResponse.json({ status: false, message: e.message }, { status: 500 });
    }
}
