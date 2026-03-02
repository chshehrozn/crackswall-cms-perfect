'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminCommentsPage() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchComments = async () => {
        try {
            const res = await fetch('/api/admin/comments');
            const json = await res.json();
            if (json.status) setComments(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.status) {
                setComments(comments.filter(c => c.id !== id));
            } else {
                alert(json.message);
            }
        } catch (e) {
            alert('Failed to delete comment');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Comments</h1>
                    <p className="text-white/50 text-sm mt-1">Manage user feedback and reviews</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            {['User', 'Comment', 'Blog Post', 'Date', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-white/30">
                                        <Loader2 className="animate-spin" size={32} />
                                        <span>Loading comments...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : comments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-white/20">
                                    <div className="flex flex-col items-center gap-2">
                                        <MessageSquare size={40} className="text-white/10" />
                                        <span>No comments found</span>
                                    </div>
                                </td>
                            </tr>
                        ) : comments.map(c => (
                            <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                <td className="px-4 py-4">
                                    <p className="text-white font-medium">{c.name}</p>
                                    <p className="text-white/40 text-xs">{c.email}</p>
                                </td>
                                <td className="px-4 py-4 max-w-sm">
                                    <p className="text-white/80 leading-relaxed italic">"{c.comment}"</p>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white font-medium truncate max-w-[200px]">{c.blog_title || 'Unknown Post'}</span>
                                        <span className="text-purple-400 text-xs flex items-center gap-1">
                                            ID: {c.blog_id}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-white/40">
                                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-4 py-4">
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        disabled={deletingId === c.id}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                                    >
                                        {deletingId === c.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
