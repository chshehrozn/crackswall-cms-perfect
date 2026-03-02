'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [siteName, setSiteName] = useState('');
    const [siteLogo, setSiteLogo] = useState('');

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const res = await fetch('/api/theme');
                const json = await res.json();
                if (json.site) {
                    setSiteName(json.site.name);
                    setSiteLogo(json.site.logo);
                }
            } catch (e) { }
        };
        fetchTheme();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await signIn('credentials', { redirect: false, email: form.email, password: form.password });
        if (res?.ok) {
            router.push('/admin');
        } else {
            setError('Invalid email or password');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    {siteLogo ? (
                        <img src={siteLogo} alt={siteName || 'Admin'} className="h-14 mx-auto mb-4 object-contain rounded-2xl" />
                    ) : (
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600 mb-4 shadow-2xl">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-white">{siteName || 'Admin Panel'}</h1>
                    <p className="text-white/50 text-sm mt-1">Management Console</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Password</label>
                        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    {error && <p className="text-red-400 text-sm bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-2">❌ {error}</p>}
                    <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500 transition disabled:opacity-50 mt-2">
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
