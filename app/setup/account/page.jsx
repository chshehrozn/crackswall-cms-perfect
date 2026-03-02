'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupAccountPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [status, setStatus] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Guard: must have gone through previous steps
        if (!sessionStorage.getItem('setup_db')) router.push('/setup');
    }, []);

    async function handleFinish() {
        if (form.password !== form.confirm) {
            setError('Passwords do not match');
            return;
        }
        setStatus('loading');
        setError('');

        const db = JSON.parse(sessionStorage.getItem('setup_db') || '{}');
        const storage = JSON.parse(sessionStorage.getItem('setup_storage') || '{"type":"local"}');

        const res = await fetch('/api/setup/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ db, storage, admin: { name: form.name, email: form.email, password: form.password } }),
        });
        const data = await res.json();

        if (data.success) {
            // Set installed cookie so middleware allows through
            document.cookie = 'cms_installed=true; path=/; max-age=31536000';
            sessionStorage.clear();
            router.push('/admin');
        } else {
            setStatus(null);
            setError(data.error || 'Setup failed. Check DB credentials and try again.');
        }
    }

    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Steps */}
            <div className="flex items-center justify-between mb-8">
                {['Database', 'Storage', 'Account'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 2 ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'}`}>
                            {i < 2 ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm font-medium ${i === 2 ? 'text-white' : 'text-white/40'}`}>{s}</span>
                        {i < 2 && <div className="w-8 h-px bg-white/20 mx-2" />}
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-bold text-white mb-1">Create Admin Account</h2>
            <p className="text-white/60 text-sm mb-6">This will be your CMS login</p>

            <div className="space-y-4">
                {[['name', 'Full Name', 'text', 'John Doe'], ['email', 'Email Address', 'email', 'admin@yoursite.com'],
                ['password', 'Password', 'password', 'Min 8 characters'], ['confirm', 'Confirm Password', 'password', '']].map(([field, label, type, ph]) => (
                    <div key={field}>
                        <label className="block text-xs font-medium text-white/70 mb-1">{label}</label>
                        <input
                            type={type} value={form[field]} placeholder={ph}
                            onChange={e => setForm({ ...form, [field]: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">❌ {error}</div>
            )}

            <div className="flex gap-3 mt-6">
                <button onClick={() => router.back()} className="flex-1 py-2.5 px-4 border border-white/20 text-white/70 rounded-lg text-sm hover:bg-white/10 transition">← Back</button>
                <button
                    onClick={handleFinish}
                    disabled={status === 'loading' || !form.name || !form.email || !form.password}
                    className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? 'Setting up…' : '🚀 Launch CMS'}
                </button>
            </div>
        </div>
    );
}
