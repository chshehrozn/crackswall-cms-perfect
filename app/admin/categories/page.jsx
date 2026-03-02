import Link from 'next/link';
import { Layers, Plus, Tag, Edit } from 'lucide-react';
import { query } from '@/lib/db';

export default async function CategoriesAdminPage() {
    let categories = [];
    try {
        const rows = await query(
            "SELECT * FROM slip_categories WHERE status='Active' ORDER BY id DESC"
        );
        // Group subcategories
        const parentCats = rows.filter(r => r.category_id === 0);
        const subcats = rows.filter(r => r.category_id !== 0);

        categories = parentCats.map(cat => {
            return {
                ...cat,
                subcategories: subcats.filter(s => s.category_id === cat.id)
            };
        });
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Categories</h1>
                    <p className="text-white/50 text-sm mt-1">Manage categories and subcategories</p>
                </div>
                <Link href="/admin/categories/add" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-indigo-500/20">
                    <Plus size={18} /> New Category
                </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm min-w-[500px]">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-4 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Category Name</th>
                                <th className="px-4 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Slug</th>
                                <th className="px-4 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Subcategories</th>
                                <th className="px-4 py-3 text-right text-white/50 font-medium text-xs uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(c => (
                                <tr key={c.id} className="border-b border-white/5">
                                    <td className="px-4 py-4 max-w-xs">
                                        <p className="text-white font-medium text-base truncate">{c.title}</p>
                                    </td>
                                    <td className="px-4 py-4 text-white/60">{c.slug || c.title?.toLowerCase().replace(/\\s+/g, '-')}</td>
                                    <td className="px-4 py-4">
                                        {c.subcategories.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {c.subcategories.map(s => (
                                                    <Link href={`/admin/categories/edit/${s.slug}`} key={s.id} className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1">
                                                        {s.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : <span className="text-white/30 text-xs italic">None</span>}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Link href={`/admin/categories/edit/${c.slug}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition inline-block">
                                            <Edit size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr><td colSpan={3} className="text-center py-12 text-white/30 flex flex-col items-center gap-2">
                                    <Layers size={40} className="text-white/10" />
                                    No categories found
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
