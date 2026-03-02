'use client';

import { useState } from 'react';
import TiptapEditor from './TiptapEditor';
import { savePage } from '@/app/admin/pages/actions';

export default function PageForm({ page }) {
    const [content, setContent] = useState(page?.content || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        formData.append('content', content);
        try {
            await savePage(page?.id || null, formData);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-white/70 text-sm mb-2">Page Title</label>
                    <input required name="title" defaultValue={page?.title} placeholder="e.g. Privacy Policy" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                    <label className="block text-white/70 text-sm mb-2">URL Slug</label>
                    <input required name="slug" defaultValue={page?.slug} placeholder="e.g. privacy-policy" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-white/70 text-sm mb-2">Status</label>
                    <select name="status" defaultValue={page?.status || 'Active'} className="w-full bg-[#1a103c] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="Active">Active (Published)</option>
                        <option value="Inactive">Inactive (Draft)</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-white/70 text-sm mb-2">Page Content</label>
                <TiptapEditor content={content} onChange={setContent} />
            </div>

            <div className="pt-4 flex justify-end gap-4">
                <a href="/admin/pages" className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition">Cancel</a>
                <button disabled={loading} type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-2.5 rounded-xl font-medium transition disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Page'}
                </button>
            </div>
        </form>
    );
}
