'use client';
import { useState, useEffect } from 'react';
import {
    Layout,
    Type,
    Palette,
    Square,
    ChevronRight,
    ChevronDown,
    Save,
    RotateCcw,
    Loader2,
    Monitor,
    Smartphone,
    Globe,
    Image as ImageIcon
} from 'lucide-react';

export default function CustomizePage() {
    const [theme, setTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('site');
    const [previewMode, setPreviewMode] = useState('desktop');
    const [previewUrl, setPreviewUrl] = useState('http://localhost:3000');

    useEffect(() => {
        // 1. Prefer Public ENV
        if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
            setPreviewUrl(process.env.NEXT_PUBLIC_FRONTEND_URL);
            return;
        }

        // 2. Fallback to Theme settings (fetched from backend)
        if (theme?.site?.frontendUrl) {
            setPreviewUrl(theme.site.frontendUrl);
            return;
        }

        // 3. Fallback to Cookies
        const cookies = document.cookie.split('; ');
        const feCookie = cookies.find(row => row.startsWith('cms_frontend_url='));

        if (feCookie) {
            setPreviewUrl(decodeURIComponent(feCookie.split('=')[1]));
        } else {
            const urlCookie = cookies.find(row => row.startsWith('cms_api_url='));
            if (urlCookie) {
                const url = decodeURIComponent(urlCookie.split('=')[1]).replace(/\/api$/, '').replace(/\/$/, '');
                setPreviewUrl(url);
            }
        }
    }, [theme?.site?.frontendUrl]);

    useEffect(() => {
        fetchTheme();
    }, []);

    const fetchTheme = async () => {
        try {
            const res = await fetch('/api/admin/theme');
            const json = await res.json();
            if (json.status) setTheme(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(theme),
            });
            const json = await res.json();
            if (json.status) {
                // Refresh iframe
                const iframe = document.getElementById('preview-iframe');
                if (iframe) iframe.contentWindow.location.reload();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const postToPreview = (updatedTheme) => {
        const iframe = document.getElementById('preview-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'THEME_UPDATE',
                theme: updatedTheme
            }, '*');
        }
    };

    const updateTheme = (section, key, value) => {
        setTheme(prev => {
            const next = {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            };
            postToPreview(next);
            return next;
        });
    };

    const handleFileUpload = async (section, key, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });
            const json = await res.json();
            if (json.success) {
                updateTheme(section, key, json.url);
            }
        } catch (e) {
            console.error('Upload failed', e);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-purple-600" size={40} />
        </div>
    );

    const SectionHeader = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveSection(activeSection === id ? null : id)}
            className={`w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition ring-inset focus:ring-1 focus:ring-purple-500/50 ${activeSection === id ? 'bg-white/5' : ''}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={activeSection === id ? 'text-purple-400' : 'text-white/40'} />
                <span className={`text-sm font-medium ${activeSection === id ? 'text-white font-semibold' : 'text-white/70'}`}>{label}</span>
            </div>
            {activeSection === id ? <ChevronDown size={16} className="text-white/30" /> : <ChevronRight size={16} className="text-white/30" />}
        </button>
    );

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
            {/* Control Panel */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-slate-900 shadow-2xl z-20 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                    <div>
                        <h1 className="text-white font-bold text-lg tracking-tight">Theme Customizer</h1>
                        <p className="text-[10px] text-purple-400 uppercase tracking-widest font-black">Live Editor</p>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={fetchTheme}
                            title="Reset to Saved"
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Settings
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/30">
                    {/* Site Settings */}
                    <SectionHeader id="site" label="Site Branding & SEO" icon={Globe} />
                    {activeSection === 'site' && (
                        <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Site Name</label>
                                <input
                                    type="text"
                                    value={theme.site.name}
                                    placeholder="e.g., ZeezSoft"
                                    onChange={(e) => updateTheme('site', 'name', e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Logo</label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={theme.site.logo}
                                            onChange={(e) => updateTheme('site', 'logo', e.target.value)}
                                            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                                        />
                                        <label className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-xl cursor-pointer transition flex items-center justify-center min-w-[44px]">
                                            <ImageIcon size={18} className="text-white/40" />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('site', 'logo', e.target.files[0])} />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-white/30 italic">Upload an image or enter a URL/path.</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Favicon</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={theme.site.favicon}
                                        onChange={(e) => updateTheme('site', 'favicon', e.target.value)}
                                        className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                                    />
                                    <label className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-xl cursor-pointer transition flex items-center justify-center min-w-[44px]">
                                        <ImageIcon size={18} className="text-white/40" />
                                        <input type="file" className="hidden" accept="image/x-icon,image/png,image/gif" onChange={(e) => handleFileUpload('site', 'favicon', e.target.files[0])} />
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={theme.site.primaryColor}
                                            onChange={(e) => updateTheme('site', 'primaryColor', e.target.value)}
                                            className="w-full h-10 rounded-xl bg-slate-800/50 border border-white/10 cursor-pointer overflow-hidden p-1 transition hover:border-white/20"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Secondary</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={theme.site.secondaryColor}
                                            onChange={(e) => updateTheme('site', 'secondaryColor', e.target.value)}
                                            className="w-full h-10 rounded-xl bg-slate-800/50 border border-white/10 cursor-pointer overflow-hidden p-1 transition hover:border-white/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header Settings */}
                    <SectionHeader id="header" label="Navigation & Header" icon={Layout} />
                    {activeSection === 'header' && (
                        <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Header Background</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={theme.header.backgroundColor}
                                        onChange={(e) => updateTheme('header', 'backgroundColor', e.target.value)}
                                        className="w-12 h-10 rounded-xl bg-slate-800/50 border border-white/10 cursor-pointer p-1"
                                    />
                                    <input
                                        type="text"
                                        value={theme.header.backgroundColor}
                                        onChange={(e) => updateTheme('header', 'backgroundColor', e.target.value)}
                                        className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-xs font-semibold text-white/70">Show Category Title</span>
                                <button
                                    onClick={() => updateTheme('header', 'showNavTitle', !theme.header.showNavTitle)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${theme.header.showNavTitle ? 'bg-purple-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme.header.showNavTitle ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Product Card Settings */}
                    <SectionHeader id="productCard" label="Listing Cards" icon={Square} />
                    {activeSection === 'productCard' && (
                        <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-xs font-semibold text-white/70">Show Ratings</span>
                                <button
                                    onClick={() => updateTheme('productCard', 'showRating', !theme.productCard.showRating)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${theme.productCard.showRating ? 'bg-purple-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme.productCard.showRating ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Card Border Color</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={theme.productCard.borderColor}
                                        onChange={(e) => updateTheme('productCard', 'borderColor', e.target.value)}
                                        className="w-12 h-10 rounded-xl bg-slate-800/50 border border-white/10 cursor-pointer p-1"
                                    />
                                    <input
                                        type="text"
                                        value={theme.productCard.borderColor}
                                        onChange={(e) => updateTheme('productCard', 'borderColor', e.target.value)}
                                        className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Settings */}
                    <SectionHeader id="menu" label="Menus & Navigation" icon={Layout} />
                    {activeSection === 'menu' && (
                        <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Active Link Color</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={theme.menu.activeColor}
                                        onChange={(e) => updateTheme('menu', 'activeColor', e.target.value)}
                                        className="w-12 h-10 rounded-xl bg-slate-800/50 border border-white/10 cursor-pointer p-1"
                                    />
                                    <input
                                        type="text"
                                        value={theme.menu.activeColor}
                                        onChange={(e) => updateTheme('menu', 'activeColor', e.target.value)}
                                        className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Link Font Size</label>
                                <select
                                    value={theme.menu.fontSize}
                                    onChange={(e) => updateTheme('menu', 'fontSize', e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                >
                                    <option value="12px">Extra Small (12px)</option>
                                    <option value="13px">Small (13px)</option>
                                    <option value="14px">Medium (14px)</option>
                                    <option value="16px">Large (16px)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Footer Settings */}
                    <SectionHeader id="footer" label="Footer Settings" icon={Layout} />
                    {activeSection === 'footer' && (
                        <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[10px] uppercase font-black text-white/40 mb-2 block tracking-wider">Copyright Notice</label>
                                <textarea
                                    rows={4}
                                    value={theme.footer.copyrightText}
                                    onChange={(e) => updateTheme('footer', 'copyrightText', e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition custom-scrollbar"
                                />
                                <p className="text-[10px] text-white/30 mt-2 font-medium italic">Available variable: {"{year}"}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 flex flex-col bg-slate-800 relative">
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900 shadow-sm z-10 transition-colors">
                    <div className="flex items-center gap-2 text-white/40">
                        <Globe size={14} />
                        <span className="text-[10px] font-mono tracking-tighter">{previewUrl}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl">
                        <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 flex justify-center items-start overflow-auto bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
                    <div className={`bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out overflow-hidden rounded-2xl border border-white/10 relative ${previewMode === 'mobile' ? 'w-[393px] h-[852px]' : 'w-full h-full'}`}>
                        <iframe
                            id="preview-iframe"
                            src={previewUrl}
                            className="w-full h-full border-none"
                            title="Theme Preview"
                        />
                        {/* Overlay to catch clicks if we want to add a selector mode later */}
                        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-2xl shadow-inner" />
                    </div>
                </div>
            </div>
        </div>
    );
}
