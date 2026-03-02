'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Plus, Search, Eye, Edit, Trash2, Image as ImageIcon, Download,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    CheckSquare, Square, Loader2, AlertTriangle, RefreshCw,
    FileText, Undo2
} from 'lucide-react';

export default function BlogsAdminPage() {
    const [frontendUrl, setFrontendUrl] = useState('http://localhost:3000');

    useEffect(() => {
        // 1. Prefer Public ENV
        if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
            setFrontendUrl(process.env.NEXT_PUBLIC_FRONTEND_URL);
            return;
        }

        // 2. Fetch from Theme API (Async Backend Data)
        fetch('/api/admin/theme')
            .then(res => res.json())
            .then(json => {
                if (json.data?.site?.frontendUrl) {
                    setFrontendUrl(json.data.site.frontendUrl);
                } else {
                    // 3. Fallback to Cookies
                    const cookies = document.cookie.split('; ');
                    const feCookie = cookies.find(row => row.startsWith('cms_frontend_url='));
                    if (feCookie) {
                        setFrontendUrl(decodeURIComponent(feCookie.split('=')[1]));
                    }
                }
            });
    }, []);

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [activeTab, setActiveTab] = useState(''); // '' = all, 'trash' = trashed
    const [categories, setCategories] = useState([]);
    const [counts, setCounts] = useState({ all_count: 0, active_count: 0, draft_count: 0, trash_count: 0 });

    // Selection
    const [selected, setSelected] = useState(new Set());
    const [bulkAction, setBulkAction] = useState('');
    const [bulkLoading, setBulkLoading] = useState(false);

    // Messages
    const [message, setMessage] = useState({ type: '', text: '' });

    // Confirm modal
    const [confirmModal, setConfirmModal] = useState(null);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('per_page', perPage.toString());
            if (activeSearch) params.set('q', activeSearch);
            if (statusFilter) params.set('status', statusFilter);
            if (categoryFilter) params.set('category', categoryFilter);
            if (activeTab) params.set('tab', activeTab);

            const res = await fetch(`/api/admin/blogs?${params.toString()}`);
            const json = await res.json();
            if (json.status) {
                setBlogs(json.data.blogs);
                setTotal(json.data.total);
                setTotalPages(json.data.totalPages);
                setCategories(json.data.categories);
                setCounts(json.data.counts);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, activeSearch, statusFilter, categoryFilter, activeTab]);

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

    useEffect(() => { setSelected(new Set()); }, [page, activeSearch, statusFilter, categoryFilter, activeTab]);

    // Clear message after 5s
    useEffect(() => {
        if (message.text) {
            const t = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(t);
        }
    }, [message]);

    // Search handler
    const handleSearch = (e) => {
        e.preventDefault();
        setActiveSearch(searchInput);
        setPage(1);
    };

    // Selection
    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === blogs.length) setSelected(new Set());
        else setSelected(new Set(blogs.map(b => b.id)));
    };

    // Bulk action
    const executeBulkAction = async (action, ids) => {
        if (!ids || ids.length === 0) {
            setMessage({ type: 'error', text: 'No items selected' });
            return;
        }

        if ((action === 'delete' || action === 'permanent_delete') && !confirmModal) {
            setConfirmModal({ action, ids });
            return;
        }

        setBulkLoading(true);
        try {
            const res = await fetch('/api/admin/blogs/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ids }),
            });
            const json = await res.json();
            if (json.status) {
                setMessage({ type: 'success', text: json.message });
                setSelected(new Set());
                setBulkAction('');
                fetchBlogs();
            } else {
                setMessage({ type: 'error', text: json.message });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to perform action' });
        } finally {
            setBulkLoading(false);
            setConfirmModal(null);
        }
    };

    // Single actions
    const handleSingleDelete = (id, title) => {
        setConfirmModal({ action: 'delete', ids: [id], title });
    };

    // Image src
    const getImageSrc = (soft_image) => {
        if (!soft_image) return null;
        if (soft_image.startsWith('http')) return soft_image;
        return `${frontendUrl}/${soft_image.replace(/^public\//, '')}`;
    };

    // Build the correct View URL: /{category-slug}/{post-slug}?preview=true
    const getViewUrl = (blog) => {
        const catSlug = blog.cat_slug || 'blog';
        return `${frontendUrl}/${catSlug}/${blog.slugs}/?preview=true`;
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Tab config
    const tabs = [
        { label: 'All', key: '', statusVal: '', count: counts.all_count },
        { label: 'Active', key: 'active', statusVal: 'Active', count: counts.active_count },
        { label: 'Draft', key: 'draft', statusVal: 'Inactive', count: counts.draft_count },
        { label: 'Trash', key: 'trash', statusVal: '', count: counts.trash_count },
    ];

    const handleTabChange = (tab) => {
        if (tab.key === 'trash') {
            setActiveTab('trash');
            setStatusFilter('');
        } else {
            setActiveTab('');
            setStatusFilter(tab.statusVal);
        }
        setPage(1);
        setSelected(new Set());
    };

    const activeTabKey = activeTab === 'trash' ? 'trash' : (statusFilter === 'Active' ? 'active' : (statusFilter === 'Inactive' ? 'draft' : ''));

    // Bulk actions depend on tab
    const bulkOptions = activeTab === 'trash'
        ? [
            { value: 'activate', label: 'Restore' },
            { value: 'permanent_delete', label: 'Delete Permanently' },
        ]
        : [
            { value: 'activate', label: 'Set Active' },
            { value: 'deactivate', label: 'Set as Draft' },
            { value: 'delete', label: 'Move to Trash' },
        ];

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Posts</h1>
                </div>
                <Link href="/admin/blogs/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 whitespace-nowrap">
                    <Plus size={18} /> Add New Post
                </Link>
            </div>

            {/* Status Tab Bar */}
            <div className="flex items-center gap-1 mb-4 text-sm border-b border-white/10 pb-3">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab)}
                        className={`px-3 py-1.5 rounded-md transition font-medium ${activeTabKey === tab.key
                            ? 'text-indigo-400 bg-indigo-500/10'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                            }`}
                    >
                        {tab.label} <span className="text-white/30 ml-0.5">({tab.count})</span>
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
                    >
                        <option value="">Bulk Actions</option>
                        {bulkOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button
                        onClick={() => bulkAction && executeBulkAction(bulkAction, [...selected])}
                        disabled={!bulkAction || selected.size === 0 || bulkLoading}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                    </button>
                    {selected.size > 0 && (
                        <span className="text-xs text-indigo-400 font-medium ml-1">{selected.size} selected</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {activeTab !== 'trash' && (
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[180px]"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    )}

                    <form onSubmit={handleSearch} className="relative flex items-center gap-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search posts…"
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-[200px]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white px-3 py-2 rounded-lg text-sm transition"
                        >
                            Search
                        </button>
                    </form>

                    {activeSearch && (
                        <button
                            onClick={() => { setSearchInput(''); setActiveSearch(''); setPage(1); }}
                            className="text-xs text-red-400 hover:text-red-300 transition whitespace-nowrap"
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${message.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="text-white/40 hover:text-white ml-4 text-lg">×</button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-4 py-3 w-10">
                                    <button onClick={toggleSelectAll} className="text-white/50 hover:text-white transition">
                                        {blogs.length > 0 && selected.size === blogs.length
                                            ? <CheckSquare size={18} className="text-indigo-400" />
                                            : <Square size={18} />
                                        }
                                    </button>
                                </th>
                                <th className="px-3 py-3 w-14"></th>
                                <th className="px-3 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Title</th>
                                <th className="px-3 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Category</th>
                                <th className="px-3 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide w-[80px]">Status</th>
                                <th className="px-3 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide w-[100px]">Downloads</th>
                                <th className="px-3 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide w-[100px]">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16">
                                        <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-2" />
                                        <p className="text-white/30 text-sm">Loading posts…</p>
                                    </td>
                                </tr>
                            ) : blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16">
                                        <FileText size={40} className="text-white/10 mx-auto mb-3" />
                                        <p className="text-white/30 text-sm">
                                            {activeTab === 'trash' ? 'Trash is empty' : 'No posts found'}
                                        </p>
                                        {activeSearch && <p className="text-white/20 text-xs mt-1">Try a different search term</p>}
                                    </td>
                                </tr>
                            ) : blogs.map(b => (
                                <tr key={b.id}
                                    className={`border-b border-white/[0.04] transition group ${selected.has(b.id) ? 'bg-indigo-500/5' : 'hover:bg-white/[0.03]'}`}
                                >
                                    <td className="px-4 py-2.5">
                                        <button onClick={() => toggleSelect(b.id)} className="text-white/40 hover:text-white transition">
                                            {selected.has(b.id)
                                                ? <CheckSquare size={16} className="text-indigo-400" />
                                                : <Square size={16} />
                                            }
                                        </button>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        {b.soft_image
                                            ? <img src={getImageSrc(b.soft_image)} alt="" className="w-9 h-9 rounded-lg object-cover bg-white/10 flex-shrink-0" />
                                            : <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/20"><ImageIcon size={16} /></div>
                                        }
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <div>
                                            <Link href={`/admin/blogs/edit/${b.cat_slug || 'uncategorized'}/${b.slugs}`} className="text-white font-medium hover:text-indigo-400 transition line-clamp-1">
                                                {b.title}
                                            </Link>
                                            <p className="text-white/30 text-xs truncate max-w-[280px]">{b.slugs}</p>
                                            {/* Row actions on hover */}
                                            <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {activeTab === 'trash' ? (
                                                    <>
                                                        <button onClick={() => executeBulkAction('activate', [b.id])} className="text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
                                                            <Undo2 size={10} /> Restore
                                                        </button>
                                                        <span className="text-white/10">|</span>
                                                        <button
                                                            onClick={() => setConfirmModal({ action: 'permanent_delete', ids: [b.id], title: b.title })}
                                                            className="text-xs text-red-400 hover:text-red-300 transition"
                                                        >
                                                            Delete Permanently
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link href={`/admin/blogs/edit/${b.cat_slug || 'uncategorized'}/${b.slugs}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition">Edit</Link>
                                                        <span className="text-white/10">|</span>
                                                        <button onClick={() => handleSingleDelete(b.id, b.title)} className="text-xs text-red-400 hover:text-red-300 transition">Trash</button>
                                                        <span className="text-white/10">|</span>
                                                        <a
                                                            href={getViewUrl(b)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-white/40 hover:text-white/70 transition"
                                                        >
                                                            View
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-white/50 text-xs">{b.cat_title || '—'}</td>
                                    <td className="px-3 py-2.5">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${b.status === 'Active'
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : 'bg-orange-500/15 text-orange-400'
                                            }`}>
                                            {b.status === 'Active' ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-white/40 text-xs">
                                        <span className="flex items-center gap-1">
                                            <Download size={12} className="text-white/20" />
                                            {Number(b.no_of_download || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-white/40 text-xs whitespace-nowrap">{formatDate(b.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom: Info + Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-5 gap-4">
                <div className="text-xs text-white/40">
                    {total > 0 && <>Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} of {total} items</>}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(1)} disabled={page <= 1} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition disabled:opacity-20 disabled:cursor-not-allowed"><ChevronsLeft size={16} /></button>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition disabled:opacity-20 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>

                        {(() => {
                            const pages = [];
                            let start = Math.max(1, page - 2);
                            let end = Math.min(totalPages, page + 2);
                            if (page <= 3) end = Math.min(5, totalPages);
                            if (page >= totalPages - 2) start = Math.max(1, totalPages - 4);

                            if (start > 1) {
                                pages.push(<button key={1} onClick={() => setPage(1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white/50 hover:bg-white/5 hover:text-white transition">1</button>);
                                if (start > 2) pages.push(<span key="s1" className="text-white/20 px-1">…</span>);
                            }
                            for (let i = start; i <= end; i++) {
                                pages.push(
                                    <button key={i} onClick={() => setPage(i)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition ${i === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                                        {i}
                                    </button>
                                );
                            }
                            if (end < totalPages) {
                                if (end < totalPages - 1) pages.push(<span key="s2" className="text-white/20 px-1">…</span>);
                                pages.push(<button key={totalPages} onClick={() => setPage(totalPages)} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white/50 hover:bg-white/5 hover:text-white transition">{totalPages}</button>);
                            }
                            return pages;
                        })()}

                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition disabled:opacity-20 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
                        <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition disabled:opacity-20 disabled:cursor-not-allowed"><ChevronsRight size={16} /></button>

                        <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                            className="ml-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/50 focus:outline-none">
                            {[5, 10, 25, 50, 100, 200].map(v => <option key={v} value={v}>{v} / page</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={20} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-lg">
                                    {confirmModal.action === 'permanent_delete' ? 'Permanently Delete?' : 'Move to Trash?'}
                                </h3>
                                <p className="text-white/50 text-sm mt-1">
                                    {confirmModal.title
                                        ? <>Are you sure you want to {confirmModal.action === 'permanent_delete' ? 'permanently delete' : 'trash'} "<span className="text-white/70">{confirmModal.title}</span>"?</>
                                        : <>Are you sure you want to {confirmModal.action === 'permanent_delete' ? 'permanently delete' : 'trash'} <span className="text-white font-medium">{confirmModal.ids.length}</span> item(s)?</>
                                    }
                                </p>
                                {confirmModal.action === 'permanent_delete' && (
                                    <p className="text-red-400/70 text-xs mt-2">⚠️ This action cannot be undone.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setConfirmModal(null)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition">
                                Cancel
                            </button>
                            <button
                                onClick={() => executeBulkAction(confirmModal.action, confirmModal.ids)}
                                disabled={bulkLoading}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition shadow-lg shadow-red-600/20 flex items-center gap-2 disabled:opacity-50">
                                {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                                {confirmModal.action === 'permanent_delete' ? 'Delete Forever' : 'Move to Trash'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
