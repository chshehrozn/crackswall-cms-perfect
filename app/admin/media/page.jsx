'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    UploadCloud, Trash2, Search, Link as LinkIcon,
    X, Check, LayoutGrid, List as ListIcon, Loader2,
    Calendar, HardDrive, FileType, CheckSquare, Square
} from 'lucide-react';

export default function MediaAdminPage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedFile, setSelectedFile] = useState(null); // For sidebar
    const [bulkMode, setBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [copied, setCopied] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [visibleCount, setVisibleCount] = useState(24);

    const fileRef = useRef(null);

    const displayedFiles = files.slice(0, visibleCount);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/media?q=${encodeURIComponent(search)}`);
            if (!res.ok) {
                const text = await res.text();
                console.error("API Error Status:", res.status, "Text:", text);
                return;
            }
            const json = await res.json();
            setFiles(json.files || []);
        } catch (e) {
            console.error("Fetch Media Error:", e);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    // Handle Upload
    const handleUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        selectedFiles.forEach(f => formData.append('files', f));

        try {
            // Fake progress for UX
            const interval = setInterval(() => {
                setUploadProgress(p => Math.min(p + 10, 90));
            }, 100);

            await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: formData
            });

            clearInterval(interval);
            setUploadProgress(100);

            setTimeout(() => {
                fetchMedia();
                setUploading(false);
                setUploadProgress(0);
                if (fileRef.current) fileRef.current.value = '';
            }, 500);
        } catch (e) {
            console.error(e);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Single Delete
    const handleDelete = async (filename) => {
        if (!confirm(`Permanently delete ${filename}?`)) return;
        try {
            await fetch('/api/admin/media/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filenames: [filename] })
            });
            if (selectedFile?.name === filename) setSelectedFile(null);
            fetchMedia();
        } catch (e) {
            console.error(e);
        }
    };

    // Bulk Delete
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Permanently delete ${selectedIds.size} file(s)?`)) return;

        try {
            await fetch('/api/admin/media/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filenames: Array.from(selectedIds) })
            });
            setSelectedIds(new Set());
            setBulkMode(false);
            setSelectedFile(null);
            fetchMedia();
        } catch (e) {
            console.error(e);
        }
    };

    const toggleSelect = (filename) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(filename)) next.delete(filename);
            else next.add(filename);
            return next;
        });
    };

    const copyUrl = (url) => {
        navigator.clipboard.writeText(url);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0A0D14]">
            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all ${selectedFile ? 'mr-80' : ''}`}>

                {/* Header Toolbar */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            Media Library
                            {uploading && (
                                <span className="text-sm font-normal text-indigo-400 flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                    <Loader2 size={14} className="animate-spin" />
                                    Uploading {uploadProgress}%
                                </span>
                            )}
                        </h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                            >
                                <UploadCloud size={18} /> Add New
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*,video/*,application/pdf"
                                multiple
                                className="hidden"
                                onChange={handleUpload}
                            />
                        </div>
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                >
                                    <ListIcon size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setBulkMode(!bulkMode);
                                    if (bulkMode) setSelectedIds(new Set());
                                    setSelectedFile(null);
                                }}
                                className={`px-4 py-2 rounded-lg border transition font-medium ${bulkMode
                                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                Bulk Select
                            </button>

                            {bulkMode && selectedIds.size > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition font-medium flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Delete Selected ({selectedIds.size})
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input
                                type="text"
                                placeholder="Search media items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 w-[240px] transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid / List View */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30">
                            <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
                            <p>Loading media library...</p>
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30 bg-white/[0.02] border border-white/5 rounded-2xl border-dashed">
                            <UploadCloud size={48} className="text-white/10 mb-4" />
                            <p className="text-lg font-medium text-white/50 mb-1">No media files found</p>
                            <p className="text-sm">Upload files or drag and drop here</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {displayedFiles.map(f => {
                                const isSelectedInBulk = bulkMode && selectedIds.has(f.name);
                                const isSidebarSelected = !bulkMode && selectedFile?.name === f.name;

                                return (
                                    <div
                                        key={f.name}
                                        onClick={() => {
                                            if (bulkMode) toggleSelect(f.name);
                                            else setSelectedFile(f);
                                        }}
                                        className={`group relative aspect-square bg-black border-2 rounded-xl overflow-hidden cursor-pointer transition-all ${isSelectedInBulk || isSidebarSelected
                                            ? 'border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                                            : 'border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <img src={f.url} alt={f.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />

                                        {/* Selection Checkbox (Bulk Mode) */}
                                        {bulkMode && (
                                            <div className="absolute top-2 left-2 z-10 bg-black/50 rounded-md backdrop-blur-sm p-0.5">
                                                {isSelectedInBulk ? <CheckSquare size={20} className="text-indigo-400" /> : <Square size={20} className="text-white/50" />}
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 ${isSelectedInBulk ? 'opacity-30' : ''}`} />
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        // List View
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02] text-white/50 text-left">
                                        {bulkMode && <th className="p-4 w-12"></th>}
                                        <th className="p-4 font-medium uppercase text-xs tracking-wider">File</th>
                                        <th className="p-4 font-medium uppercase text-xs tracking-wider">Date</th>
                                        <th className="p-4 font-medium uppercase text-xs tracking-wider">Size</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedFiles.map(f => {
                                        const isSelectedInBulk = bulkMode && selectedIds.has(f.name);
                                        const isSidebarSelected = !bulkMode && selectedFile?.name === f.name;

                                        return (
                                            <tr
                                                key={f.name}
                                                onClick={() => {
                                                    if (bulkMode) toggleSelect(f.name);
                                                    else setSelectedFile(f);
                                                }}
                                                className={`cursor-pointer border-b border-white/[0.02] transition ${isSelectedInBulk || isSidebarSelected ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'
                                                    }`}
                                            >
                                                {bulkMode && (
                                                    <td className="p-4 pb-3 pt-3">
                                                        {isSelectedInBulk ? <CheckSquare size={18} className="text-indigo-400" /> : <Square size={18} className="text-white/30" />}
                                                    </td>
                                                )}
                                                <td className="p-4 pb-3 pt-3 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-white/10">
                                                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-medium">{f.name}</span>
                                                        <span className="text-white/40 text-xs mt-0.5">{f.url}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 pb-3 pt-3 text-white/60">{formatDate(f.modified)}</td>
                                                <td className="p-4 pb-3 pt-3 text-white/60">{f.sizeFormatted}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {visibleCount < files.length && (
                        <div className="flex justify-center mt-6 py-6 border-t border-white/5">
                            <button
                                onClick={() => setVisibleCount(v => v + 24)}
                                className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition flex items-center gap-2"
                            >
                                <span className="font-medium">Load More</span>
                                <span className="text-white/40 text-sm">Showing {visibleCount} of {files.length}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Details Panel */}
            <div className={`fixed right-0 top-[64px] bottom-0 w-80 bg-[#11141D] border-l border-white/5 shadow-2xl transform transition-transform duration-300 z-40 flex flex-col ${selectedFile && !bulkMode ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        Attachment Details
                    </h3>
                    <button onClick={() => setSelectedFile(null)} className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition">
                        <X size={20} />
                    </button>
                </div>

                {selectedFile && (
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                        <div className="mb-6 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center p-2">
                            <img src={selectedFile.url} alt={selectedFile.name} className="max-w-full max-h-[200px] object-contain rounded-lg" />
                        </div>

                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="text-white font-medium break-all">{selectedFile.name}</h4>
                            </div>

                            <div className="grid grid-cols-[20px_1fr] items-center gap-3 text-white/60">
                                <Calendar size={14} />
                                <span>{formatDate(selectedFile.modified)}</span>

                                <HardDrive size={14} />
                                <span>{selectedFile.sizeFormatted}</span>

                                <FileType size={14} />
                                <span>{selectedFile.ext?.toUpperCase() || 'IMAGE'}</span>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">File URL</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            readOnly
                                            value={selectedFile.url}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none"
                                        />
                                        <button
                                            onClick={() => copyUrl(selectedFile.url)}
                                            className="p-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg transition shrink-0"
                                            title="Copy URL"
                                        >
                                            {copied === selectedFile.url ? <Check size={16} /> : <LinkIcon size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={() => handleDelete(selectedFile.name)}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition font-medium"
                                >
                                    <Trash2 size={16} /> Delete Permanently
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
