'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupStoragePage() {
    const router = useRouter();
    const [type, setType] = useState('local');
    const [localPath, setLocalPath] = useState('/var/www/html/storage/images');
    const [localUrl, setLocalUrl] = useState('https://yourserver.com/images');
    const [s3, setS3] = useState({ bucket: '', region: 'us-east-1', key: '', secret: '' });
    const [ftp, setFtp] = useState({ host: '', user: '', password: '', remotePath: '/public_html/images', publicUrl: 'https://yourserver.com/images' });

    function handleNext() {
        const storageConfig = {
            type,
            ...(type === 'local' && { local: { path: localPath, url: localUrl } }),
            ...(type === 's3' && { s3 }),
            ...(type === 'ftp' && { ftp }),
        };
        sessionStorage.setItem('setup_storage', JSON.stringify(storageConfig));
        router.push('/setup/account');
    }

    const tabClass = (t) =>
        `flex-1 py-2 px-3 text-sm font-medium rounded-lg transition ${type === t ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`;

    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Steps */}
            <div className="flex items-center justify-between mb-8">
                {['Database', 'Storage', 'Account'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 1 ? 'bg-purple-500 text-white' : i < 1 ? 'bg-green-500 text-white' : 'bg-white/20 text-white/50'}`}>
                            {i < 1 ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm font-medium ${i === 1 ? 'text-white' : 'text-white/40'}`}>{s}</span>
                        {i < 2 && <div className="w-8 h-px bg-white/20 mx-2" />}
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-bold text-white mb-1">File Storage</h2>
            <p className="text-white/60 text-sm mb-6">Where should uploaded images and files be stored?</p>

            {/* Type tabs */}
            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
                {[['local', '🖥 Local Server'], ['s3', '☁️ Amazon S3'], ['ftp', '📁 FTP']].map(([t, label]) => (
                    <button key={t} className={tabClass(t)} onClick={() => setType(t)}>{label}</button>
                ))}
            </div>

            {type === 'local' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Absolute Path on Server</label>
                        <input value={localPath} onChange={e => setLocalPath(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <p className="text-white/40 text-xs mt-1">Directory where files will be saved on your server</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Public URL Base</label>
                        <input value={localUrl} onChange={e => setLocalUrl(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <p className="text-white/40 text-xs mt-1">How files are accessed from the browser</p>
                    </div>
                </div>
            )}

            {type === 's3' && (
                <div className="space-y-4">
                    {[['bucket', 'Bucket Name'], ['region', 'Region'], ['key', 'Access Key ID'], ['secret', 'Secret Access Key']].map(([k, label]) => (
                        <div key={k}>
                            <label className="block text-xs font-medium text-white/70 mb-1">{label}</label>
                            <input type={k === 'secret' ? 'password' : 'text'} value={s3[k]} onChange={e => setS3({ ...s3, [k]: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    ))}
                </div>
            )}

            {type === 'ftp' && (
                <div className="space-y-4">
                    {[['host', 'FTP Host'], ['user', 'Username'], ['password', 'Password'], ['remotePath', 'Remote Path'], ['publicUrl', 'Public URL']].map(([k, label]) => (
                        <div key={k}>
                            <label className="block text-xs font-medium text-white/70 mb-1">{label}</label>
                            <input type={k === 'password' ? 'password' : 'text'} value={ftp[k]} onChange={e => setFtp({ ...ftp, [k]: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-3 mt-6">
                <button onClick={() => router.back()} className="flex-1 py-2.5 px-4 border border-white/20 text-white/70 rounded-lg text-sm font-medium hover:bg-white/10 transition">← Back</button>
                <button onClick={handleNext} className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-500 transition">Next →</button>
            </div>
        </div>
    );
}
