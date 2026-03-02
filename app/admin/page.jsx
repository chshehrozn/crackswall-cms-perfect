import { query } from '@/lib/db';
import Link from 'next/link';
import { FileText, Layers, MessageSquare, Plus, Download, Edit } from 'lucide-react';
import { readTheme } from '@/lib/theme';
import DashboardImageFallback from '@/components/admin/DashboardImageFallback';

async function getStats() {
    // ... existing getStats
    try {
        const [blogsRes, catsRes, commentsRes, topBlogs] = await Promise.all([
            query("SELECT COUNT(*) as cnt FROM blogs WHERE status='Active' AND is_deleted IS NULL"),
            query("SELECT COUNT(*) as cnt FROM slip_categories WHERE status='Active' AND category_id=0"),
            query("SELECT COUNT(*) as cnt FROM comments"),
            query(`SELECT b.id, b.title, b.no_of_download, b.slugs, b.soft_image,
              c.title as cat_title
             FROM blogs b
             LEFT JOIN slip_categories c ON b.category_id = c.id
             WHERE b.status='Active'
             ORDER BY b.no_of_download DESC LIMIT 5`),
        ]);
        return {
            blogs: blogsRes[0]?.cnt || 0,
            categories: catsRes[0]?.cnt || 0,
            comments: commentsRes[0]?.cnt || 0,
            topBlogs,
        };
    } catch (e) {
        console.error(e);
        return { blogs: 0, categories: 0, comments: 0, topBlogs: [] };
    }
}

export default async function AdminDashboard() {
    const { blogs, categories, comments, topBlogs } = await getStats();
    const theme = await readTheme();
    const siteName = theme?.site?.name || 'CracksWall';

    const stats = [
        { label: 'Total Blogs', value: blogs, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/admin/blogs' },
        { label: 'Categories', value: categories, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admin/categories' },
        { label: 'Comments', value: comments, icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', href: '/admin/comments' },
    ];

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-white/50 text-sm mt-1">Welcome back to {siteName} CMS</p>
                </div>
                <Link href="/admin/blogs/new" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-purple-600/20">
                    <Plus size={18} /> New Blog
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {stats.map(s => (
                    <Link key={s.label} href={s.href}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/50 text-sm">{s.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">{Number(s.value).toLocaleString()}</p>
                            </div>
                            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition`}>
                                <s.icon size={24} className={s.color} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">🔥 Top Downloads</h2>
                <div className="space-y-3">
                    {topBlogs.length === 0 && <p className="text-white/40 text-sm">No blogs yet</p>}
                    {topBlogs.map(b => (
                        <div key={b.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 px-2 -mx-2 rounded-xl transition">
                            <DashboardImageFallback src={b.soft_image} alt={b.title} className="w-12 h-12 rounded-xl object-cover shadow-md" />
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{b.title}</p>
                                <p className="text-white/40 text-xs">{b.cat_title}</p>
                            </div>
                            <span className="text-white/60 text-sm flex items-center gap-1">
                                <Download size={14} /> {Number(b.no_of_download || 0).toLocaleString()}
                            </span>
                            <Link href={`/admin/blogs/${b.id}`} className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-xs px-3 py-1.5 border border-purple-500/40 rounded-lg transition bg-purple-500/5">
                                <Edit size={12} /> Edit
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
