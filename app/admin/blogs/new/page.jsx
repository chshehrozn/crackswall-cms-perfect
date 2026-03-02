import { query } from '@/lib/db';
import BlogForm from '@/components/admin/BlogForm';
import Link from 'next/link';

export default async function NewBlogPage() {
    let categories = [];
    let activeLanguages = [];
    try {
        [categories, activeLanguages] = await Promise.all([
            query("SELECT id, title, category_id FROM slip_categories WHERE status='Active'"),
            query("SELECT name, locale FROM languages WHERE status = 'Active' ORDER BY id ASC")
        ]);
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/blogs" className="text-white/50 hover:text-white transition">
                    ← Back
                </Link>
                <h1 className="text-2xl font-bold text-white">Write New Blog</h1>
            </div>
            <BlogForm blog={null} categories={categories} languages={activeLanguages} translations={[]} />
        </div>
    );
}
