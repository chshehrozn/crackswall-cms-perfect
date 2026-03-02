// Storage abstraction — handles local disk, S3, or FTP
// Reads storage config from config.json

import fs from 'fs';
import path from 'path';
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
    const cfg = readConfig();
    const storage = cfg?.storage;
    if (!storage || storage.type === 'local') {
        const dir = storage?.local?.path || path.join(process.cwd(), 'public/images');
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir)
            .filter(f => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f))
            .map(f => ({ name: f, url: getFileUrl(f) }));
    }
    return []; // S3/FTP listing handled separately
}

export function deleteFile(filename) {
    const cfg = readConfig();
    const storage = cfg?.storage;
    if (!storage || storage.type === 'local') {
        const dir = storage?.local?.path || path.join(process.cwd(), 'public/images');
        const filePath = path.join(dir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return true;
    }
    return false;
}

// --- Local disk ---
function saveLocal(buffer, filename, customPath) {
    const dir = customPath || path.join(process.cwd(), 'public/images');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fullPath = path.join(dir, filename);
    fs.writeFileSync(fullPath, buffer);
    return getFileUrl(filename);
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
    const ftp = await import('basic-ftp');
    const client = new ftp.Client();
    await client.access({ host: ftpcfg.host, user: ftpcfg.user, password: ftpcfg.password, secure: false });
    const tmpPath = path.join('/tmp', filename);
    fs.writeFileSync(tmpPath, buffer);
    await client.uploadFrom(tmpPath, `${ftpcfg.remotePath}/${filename}`);
    client.close();
    fs.unlinkSync(tmpPath);
    return getFileUrl(filename);
}
