import { query } from '@/lib/db';
import { saveCategory } from '../actions';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import TranslationTabs from '@/components/admin/TranslationTabs';

export default async function AddCategoryPage() {
    let parentCategories = [];
    let activeLanguages = [];

    try {
        parentCategories = await query("SELECT id, title FROM slip_categories WHERE category_id = 0 ORDER BY title ASC");
        activeLanguages = await query("SELECT name, locale FROM languages WHERE status = 'Active' ORDER BY id ASC");
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/categories" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition">
                    <ArrowLeft size={20} className="text-white/70" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Add Category</h1>
                    <p className="text-white/50 text-sm mt-1">Create a new category or subcategory</p>
                </div>
            </div>

            <form action={saveCategory.bind(null, null)} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                    {/* Translation Tabs for Multilingual Content */}
                    <div className="mb-8">
                        <TranslationTabs
                            languages={activeLanguages}
                            translations={[]}
                            tableName="slip_categories"
                            rowId={null}
                            defaultValues={{}}
                        />
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/5">
                        {/* URL Slug */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70">URL Slug (System ID)</label>
                            <input
                                type="text"
                                name="slug"
                                placeholder="Auto-generated if left blank"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                        </div>

                        {/* Parent Category & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Parent Category</label>
                                <select
                                    name="category_id"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                >
                                    <option value="0">None (Make it a Parent Category)</option>
                                    {parentCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Status</label>
                                <select
                                    name="status"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        {/* SVG Icon */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70">SVG Icon Code</label>
                            <textarea
                                name="icon_code"
                                rows={3}
                                placeholder="<svg>...</svg>"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white/70 font-mono text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition custom-scrollbar resize-none"
                            ></textarea>
                            <p className="text-xs text-white/40">Optional. Only useful for parent categories displayed in sidebars.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link href="/admin/categories" className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition font-medium">
                        Cancel
                    </Link>
                    <button type="submit" className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium flex items-center gap-2 transition shadow-lg shadow-indigo-500/20">
                        <Save size={18} /> Save Category
                    </button>
                </div>
            </form>
        </div>
    );
}
