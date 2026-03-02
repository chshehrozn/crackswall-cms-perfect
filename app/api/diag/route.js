import { NextResponse } from 'next/server';
import { getCmsConfig, isInstalled } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Force Node.js runtime for full env access

export async function GET() {
    const config = await getCmsConfig();

    // Detailed Env Check (Masked)
    const envVars = {
        CMS_API_URL: process.env.CMS_API_URL ? 'EXISTS' : 'MISSING',
        CMS_API_TOKEN: process.env.CMS_API_TOKEN ? 'EXISTS' : 'MISSING',
        NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL ? 'EXISTS' : 'MISSING',
        NODE_ENV: process.env.NODE_ENV,
        NEXT_RUNTIME: process.env.NEXT_RUNTIME || 'nodejs (default)',
    };

    const results = {
        timestamp: new Date().toISOString(),
        isInstalled: await isInstalled(),
        envVars,
        config: {
            apiUrl: config.apiUrl || 'MISSING',
            apiToken: config.apiToken ? '*****' + config.apiToken.slice(-4) : 'MISSING',
            frontendUrl: config.frontendUrl || 'MISSING',
        },
        connectivity: {
            reachable: false,
            httpStatus: null,
            error: null,
            responseTime: null,
        },
        database: {
            testQuery: false,
            result: null,
            error: null,
            schema: null,
            count: null
        }
    };

    if (config.apiUrl) {
        const start = Date.now();
        try {
            const cleanUrl = config.apiUrl.replace(/\/$/, '');
            const targetUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

            // Test 1: Simple GET
            const res = await fetch(`${targetUrl.replace('/api', '')}/`, {
                method: 'GET',
                cache: 'no-store',
                next: { revalidate: 0 }
            });
            results.connectivity.reachable = true;
            results.connectivity.httpStatus = res.status;
            results.connectivity.responseTime = `${Date.now() - start}ms`;

            if (config.apiToken) {
                // Test 2: Database Query
                const dbRes = await fetch(`${targetUrl}/cms-query`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CMS-MASTER-TOKEN': config.apiToken
                    },
                    body: JSON.stringify({ sql: 'SELECT 1 as test', params: [] }),
                    cache: 'no-store'
                });

                if (dbRes.ok) {
                    results.database.testQuery = true;
                    results.database.result = await dbRes.json();

                    // Test 3: Schema check
                    const schemaRes = await fetch(`${targetUrl}/cms-query`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CMS-MASTER-TOKEN': config.apiToken
                        },
                        body: JSON.stringify({ sql: 'DESCRIBE blogs', params: [] }),
                        cache: 'no-store'
                    });
                    if (schemaRes.ok) results.database.schema = await schemaRes.json();

                    // Test 4: Count
                    const dataRes = await fetch(`${targetUrl}/cms-query`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CMS-MASTER-TOKEN': config.apiToken
                        },
                        body: JSON.stringify({ sql: 'SELECT COUNT(*) as total FROM blogs', params: [] }),
                        cache: 'no-store'
                    });
                    if (dataRes.ok) results.database.count = await dataRes.json();
                } else {
                    const text = await dbRes.text();
                    results.database.error = `HTTP ${dbRes.status}: ${text.substring(0, 100)}`;
                }
            }
        } catch (e) {
            results.connectivity.error = e.message;
        }
    }

    return NextResponse.json(results);
}
