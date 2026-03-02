'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Database, HardDrive, Layout } from 'lucide-react';

export default function AdminSettingsPage() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Auto-detect proxy mode (presence of API URL/Token in cookies or env)
    const [isProxyMode, setIsProxyMode] = useState(false);

    useEffect(() => {
        fetchSettings();
        const hasProxy = typeof document !== 'undefined' &&
            (document.cookie.includes('cms_api_url') || process.env.NEXT_PUBLIC_CMS_API_URL);
        setIsProxyMode(!!hasProxy);
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const json = await res.json();
            if (json.status) setConfig(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const json = await res.json();
            if (json.status) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
            } else {
                setMessage({ type: 'error', text: json.message });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-white/30">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-sm">Loading site configuration...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
                    <p className="text-white/50 text-sm mt-1">Configure your CMS and backend environment</p>
                </div>
                {message.text && (
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium shrink-0 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Site Configuration */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6 text-indigo-400">
                        <Layout size={20} />
                        <h2 className="text-lg font-semibold text-white">Site Appearance</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Site Name</label>
                            <input
                                type="text"
                                value={config?.site?.name || ''}
                                onChange={(e) => setConfig({ ...config, site: { ...config.site, name: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="e.g. ShehrozPC"
                            />
                            <p className="text-white/30 text-xs">Used in CMS tab title and branding.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Tagline</label>
                            <input
                                type="text"
                                value={config?.site?.tagline || ''}
                                onChange={(e) => setConfig({ ...config, site: { ...config.site, tagline: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="e.g. Full Version Software"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Homepage Meta Description</label>
                            <textarea
                                rows={3}
                                value={config?.site?.metaDescription || ''}
                                onChange={(e) => setConfig({ ...config, site: { ...config.site, metaDescription: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* SEO Configuration */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6 text-green-400">
                        <Layout size={20} />
                        <h2 className="text-lg font-semibold text-white">SEO & Indexing</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Robots.txt Content</label>
                            <textarea
                                rows={4}
                                value={config?.seo?.robotsTxt || ''}
                                onChange={(e) => setConfig({ ...config, seo: { ...config.seo, robotsTxt: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div>
                                <p className="text-white font-medium">Sitemap.xml Generation</p>
                                <p className="text-white/40 text-sm">Automatically generate /sitemap.xml</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, seo: { ...config.seo, sitemapEnabled: !config?.seo?.sitemapEnabled } })}
                                className={`w-12 h-6 rounded-full transition relative ${config?.seo?.sitemapEnabled ? 'bg-green-600' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config?.seo?.sitemapEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Environment Configuration */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6 text-blue-400">
                        <HardDrive size={20} />
                        <h2 className="text-lg font-semibold text-white">Environment & Links</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Frontend Website URL</label>
                            <input
                                type="url"
                                value={config?.site?.frontendUrl || ''}
                                onChange={(e) => setConfig({ ...config, site: { ...config.site, frontendUrl: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="https://www.example.com"
                            />
                            <p className="text-white/30 text-[10px] mt-1 italic">Used for Customizer preview and View links.</p>
                        </div>
                    </div>
                </div>

                {/* Database Connection (Hidden in Proxy Mode) */}
                {!isProxyMode && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6 text-orange-400">
                            <Database size={20} />
                            <h2 className="text-lg font-semibold text-white">Local Database Connection</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Host</label>
                                <input
                                    type="text"
                                    value={config?.db?.host || ''}
                                    onChange={(e) => setConfig({ ...config, db: { ...config.db, host: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Database Name</label>
                                <input
                                    type="text"
                                    value={config?.db?.database || ''}
                                    onChange={(e) => setConfig({ ...config, db: { ...config.db, database: e.target.value } })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Google Sheets Integration */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6 text-emerald-400">
                        <Database size={20} />
                        <h2 className="text-lg font-semibold text-white">Google Sheets Sync</h2>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-white/70">
                            Sync rows from Google Sheets directly to your CMS database. Use the Apps Script extension in your sheet.
                        </p>
                        <div className="p-4 bg-black/40 border border-emerald-500/20 rounded-xl">
                            <pre className="text-[10px] text-emerald-400/70 overflow-x-auto whitespace-pre-wrap">
                                {`// Webhook URL: /api/admin/sync\n// Secret: ${config?.security?.adminSecret || 'YOUR_SECRET'}`}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl font-bold transition shadow-2xl shadow-purple-900/40 disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save All Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
