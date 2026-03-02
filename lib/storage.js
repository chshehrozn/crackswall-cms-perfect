// Storage abstraction — handles local disk, S3, or FTP
// Reads storage config from config.json

import { readConfig } from './config.js';

export async function saveFile(buffer, filename) {
    const cfg = readConfig();
    const storage = cfg?.storage;

    if (!storage || storage.type === 'local') {
        return saveLocal(buffer, filename, storage?.local?.path);
    }
    if (storage.type === 's3') {
        return saveS3(buffer, filename, storage.s3);
    }
    if (storage.type === 'ftp') {
        return saveFTP(buffer, filename, storage.ftp);
    }
    throw new Error('Unknown storage type');
}

export function getFileUrl(filename) {
    const cfg = readConfig();
    const storage = cfg?.storage;
    if (!storage || storage.type === 'local') {
        return `/images/${filename}`;
    }
    if (storage.type === 's3') {
        return `https://${storage.s3.bucket}.s3.${storage.s3.region}.amazonaws.com/${filename}`;
    }
    if (storage.type === 'ftp') {
        return `${storage.ftp.publicUrl}/${filename}`;
    }
    return `/images/${filename}`;
}

export function listFiles() {
    if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') return [];
    // Only Node.js can list files
    return []; // We'll handle this purely in API routes if needed, or via backend
}

export function deleteFile(filename) {
    if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') return false;
    return false;
}

// --- Local disk ---
function saveLocal(buffer, filename, customPath) {
    return ''; // Vercel has no local persistent storage
}

// --- S3 --- (requires aws-sdk if used)
async function saveS3(buffer, filename, s3cfg) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({ region: s3cfg.region, credentials: { accessKeyId: s3cfg.key, secretAccessKey: s3cfg.secret } });
    await client.send(new PutObjectCommand({ Bucket: s3cfg.bucket, Key: filename, Body: buffer, ContentType: 'image/webp' }));
    return getFileUrl(filename);
}

// --- FTP --- (requires basic-ftp if used)
async function saveFTP(buffer, filename, ftpcfg) {
    return ''; // Skip in Edge/Vercel
}
