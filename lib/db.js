import mysql from 'mysql2/promise';
import { readConfig, getCmsConfig } from './config.js';

const globalForDb = globalThis;

function getPool() {
    try {
        if (!globalForDb.pool) {
            const cfg = readConfig();
            if (!cfg?.db) return null; // No config, no pool
            globalForDb.pool = mysql.createPool({
                host: cfg.db.host,
                port: parseInt(cfg.db.port),
                database: cfg.db.database,
                user: cfg.db.user,
                password: cfg.db.password,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
            });
        }
        return globalForDb.pool;
    } catch (e) {
        return null;
    }
}

export async function query(sql, params = []) {
    // 1. Check for Config (Env > Cookies)
    try {
        const { apiUrl, apiToken } = await getCmsConfig();

        if (apiUrl && apiToken) {
            const res = await fetch(`${apiUrl}/cms-query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CMS-MASTER-TOKEN': apiToken
                },
                body: JSON.stringify({ sql, params }),
                cache: 'no-store'
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // For SELECT, return the array directly. 
            // For INSERT/UPDATE, return result object matching mysql2 format
            if (Array.isArray(data)) return data;
            return { insertId: data.insertId, affectedRows: data.affected };
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
