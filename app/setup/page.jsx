'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupLinkPage() {
    const router = useRouter();
    const [form, setForm] = useState({ apiUrl: '', apiToken: '', frontendUrl: '' });
    const [status, setStatus] = useState(null); // null | 'connecting' | 'success' | 'error'
    const [error, setError] = useState('');

    async function handleConnect() {
        if (!form.frontendUrl) {
            setError('Please enter your Frontend Website URL');
            return;
        }
        setStatus('connecting');
        setError('');

        try {
            const res = await fetch('/api/setup/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (data.success) {
                setStatus('success');
                // Session storage for flow persistence
                sessionStorage.setItem('setup_api', JSON.stringify(form));

                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push('/admin/login');
                }, 1500);
            } else {
                setStatus('error');
                setError(data.error || 'Connection failed. Check URL and Token.');
            }
        } catch (e) {
            setStatus('error');
            setError('Network error. Is your backend online?');
        }
    }

    return (
        <div className="bg-[#1a103c]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-10 max-w-lg w-full">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30">
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Master Installer</h2>
                <p className="text-purple-200/50 text-sm mt-2">Link your CMS to your remote backend in seconds</p>
            </div>

            <div className="space-y-5">
                <div className="group transition-all">
                    <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2 px-1">Backend API Endpoint</label>
                    <input
                        type="url"
                        value={form.apiUrl}
                        onChange={e => setForm({ ...form, apiUrl: e.target.value })}
                        placeholder="https://be.example.com/api"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all"
                    />
                </div>

                <div className="group transition-all text-purple-400">
                    <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2 px-1">Frontend Website URL</label>
                    <input
                        type="url"
                        value={form.frontendUrl}
                        onChange={e => setForm({ ...form, frontendUrl: e.target.value })}
                        placeholder="https://www.example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all"
                    />
                    <p className="text-[10px] text-purple-400/40 mt-2 px-1">The live URL where your users will access the software library.</p>
                </div>

                <div className="group transition-all">
                    <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2 px-1">Master API Token</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={form.apiToken}
                            onChange={e => setForm({ ...form, apiToken: e.target.value })}
                            placeholder="••••••••••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all font-mono"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex items-center gap-3 animate-in fade-in zoom-in-95">
                    <span className="shrink-0 w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center font-bold">!</span>
                    {error}
                </div>
            )}

            <div className="mt-10">
                <button
                    onClick={handleConnect}
                    disabled={status === 'connecting' || status === 'success'}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold shadow-xl shadow-purple-900/40 border border-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {status === 'connecting' ? (
                        <span className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Linking System...
                        </span>
                    ) : 'Initialize Connection ➔'}
                </button>
            </div>

            <p className="text-center text-white/20 text-[10px] mt-8 font-medium">
                POWERED BY CRACKSWALL AUTOMATION • ZERO-DATABASE MODE
            </p>
        </div>
    );
}
