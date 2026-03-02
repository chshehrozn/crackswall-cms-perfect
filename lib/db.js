import { readConfig, getCmsConfig } from './config.js';

const globalForDb = globalThis;

function getPool() {
    return null; // Database only available in Node.js runtime via server utilities
}

export async function query(sql, params = []) {
    // 1. Check for Config (Env > Cookies)
    try {
        const { apiUrl, apiToken } = await getCmsConfig();

        if (apiUrl && apiToken) {
            // Laravel prefix handling: Ensure apiUrl includes /api
            const cleanUrl = apiUrl.replace(/\/$/, '');
            const targetUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

            const res = await fetch(`${targetUrl}/cms-query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CMS-MASTER-TOKEN': apiToken
                },
                body: JSON.stringify({ sql, params }),
                cache: 'no-store'
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Proxy error (${res.status}): ${text.substring(0, 100)}`);
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // For SELECT, return the array directly. 
            // For INSERT/UPDATE/DELETE, return result object matching mysql2 format
            if (Array.isArray(data)) return data;
            return {
                insertId: data.insertId || null,
                affectedRows: data.affected !== undefined ? data.affected : (data.success ? 1 : 0)
            };
        }
    } catch (e) {
        // Fallback to local DB if cookies fail (common during build) or not available
        if (process.env.NODE_ENV !== 'production') {
            console.warn('DB Proxy check skipped:', e.message);
        }
    }

    // 2. Fallback to local MySQL
    const p = getPool();
    if (!p) return []; // Return empty instead of crashing build
    const [rows] = await p.execute(sql, params);
    return rows;
}

export async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
}
