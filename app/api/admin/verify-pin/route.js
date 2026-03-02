import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config-server';

export async function POST(request) {
    try {
        const { pin } = await request.json();
        const config = readConfig();
        const adminPin = config?.security?.adminPin || '0000';

        if (pin === adminPin) {
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, message: 'Invalid PIN' }, { status: 403 });
    } catch {
        return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
    }
}
