import { NextResponse } from 'next/server';
import { isInstalled } from '@/lib/config';

// Public API — returns whether the CMS is installed (reads config.json server-side)
export function GET() {
    return NextResponse.json({ installed: isInstalled() });
}
