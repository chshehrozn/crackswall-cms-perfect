import { query } from '@/lib/db';
import Link from 'next/link';

export default async function PagesAdminPage() {
    let pages = [];
    try {
        pages = await query("SELECT * FROM pages ORDER BY id DESC");
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pages</h1>
                    <p className="text-white/40 text-sm mt-1">Manage static website pages (e.g. Privacy Policy, Terms)</p>
                </div>
                <Link href="/admin/pages/new" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                    + New Page
                </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Title</th>
                            <th className="px-4 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Slug (URL)</th>
                            <th className="px-4 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Status</th>
                            <th className="px-4 py-3 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(p => (
                            <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                <td className="px-4 py-4 max-w-xs">
                                    <p className="text-white font-medium text-base truncate">{p.title}</p>
                                </td>
                                <td className="px-4 py-4 text-white/60">/{p.slug}</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                        <Link href={`/admin/pages/${p.id}`} className="text-purple-400 hover:text-purple-300 text-xs px-3 py-1 border border-purple-500/40 rounded-lg transition">Edit</Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-12 text-white/30">No pages found. Create your first page!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
