import { NextResponse } from 'next/server';
import { getCmsConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
    const config = await getCmsConfig();
    const results = {
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
            error: null
        }
    };

    if (config.apiUrl) {
        const start = Date.now();
        try {
            // Laravel prefix handling matches lib/db.js
            const cleanUrl = config.apiUrl.replace(/\/$/, '');
            const targetUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

            // Test 1: Simple GET to check if Laravel is there
            const res = await fetch(`${targetUrl.replace('/api', '')}/`, {
                method: 'GET',
                cache: 'no-store'
            });
            results.connectivity.reachable = true;
            results.connectivity.httpStatus = res.status;
            results.connectivity.responseTime = `${Date.now() - start}ms`;

            // Test 2: Database Query test
            if (config.apiToken) {
                const dbStart = Date.now();

                // Test 2: Database Query test
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
                    const dbData = await dbRes.json();
                    results.database.testQuery = true;
                    results.database.result = dbData;

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
                    if (schemaRes.ok) {
                        results.database.schema = await schemaRes.json();
                    }

                    // Test 4: Sample Data check
                    const dataRes = await fetch(`${targetUrl}/cms-query`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CMS-MASTER-TOKEN': config.apiToken
                        },
                        body: JSON.stringify({ sql: 'SELECT COUNT(*) as total FROM blogs', params: [] }),
                        cache: 'no-store'
                    });
                    if (dataRes.ok) {
                        results.database.count = await dataRes.json();
                    }
                } else {
                    const dbText = await dbRes.text();
                    results.database.error = `HTTP ${dbRes.status}: ${dbText.substring(0, 100)}`;
                }
            }
        } catch (e) {
            results.connectivity.error = e.message;
        }
    }

    return NextResponse.json(results);
}
