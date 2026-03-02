import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config';

export async function POST(request) {
    try {
        const pin = request.headers.get('x-admin-pin');
        const config = readConfig();
        const adminPin = config?.security?.adminPin || '0000';

        if (!pin || pin !== adminPin) {
            return NextResponse.json({ status: false, output: 'Access Denied: Invalid Master PIN.' }, { status: 403 });
        }

        const { command, cwd } = await request.json();

        // Node.js only dependencies
        const { exec } = eval('require("child_process")');
        const util = eval('require("util")');
        const path = eval('require("path")');
        const execAsync = util.promisify(exec);

        let execCwd = process.cwd();
        if (cwd) {
            execCwd = path.join(process.cwd(), cwd);
        }

        // Basic execution runner
        const { stdout, stderr } = await execAsync(command, { cwd: execCwd });

        return NextResponse.json({ status: true, output: stdout || stderr || 'Command executed successfully with no output.' });
    } catch (e) {
        return NextResponse.json({ status: false, output: e.stdout || e.stderr || e.message });
    }
}
