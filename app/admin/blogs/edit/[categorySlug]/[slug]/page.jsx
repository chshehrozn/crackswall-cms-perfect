import { query, queryOne } from '@/lib/db';
import BlogForm from '@/components/admin/BlogForm';
import Link from 'next/link';

export default async function EditBlogPage({ params }) {
    const { slug } = await params;

    let blog = null;
    let categories = [];
    let sliderImages = [];
    let activeLanguages = [];
    let existingTranslations = [];
    try {
        [blog, categories, activeLanguages] = await Promise.all([
            queryOne('SELECT * FROM blogs WHERE slugs = ?', [slug]),
            query("SELECT id, title, category_id FROM slip_categories WHERE status='Active'"),
            query("SELECT name, locale FROM languages WHERE status = 'Active' ORDER BY id ASC")
        ]);
        if (blog) {
            sliderImages = await query('SELECT * FROM blog_images WHERE blog_id = ?', [blog.id]);
            blog.images = sliderImages || [];

            existingTranslations = await query(
                "SELECT column_name, locale, value FROM translations WHERE table_name = 'blogs' AND row_id = ?",
                [blog.id]
            );
        }
    } catch (e) {
        console.error(e);
    }

    if (!blog) {
        return (
            <div className="p-8 text-center text-white/50">
                Blog not found.
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/blogs" className="text-white/50 hover:text-white transition">
                    ← Back
                </Link>
                <h1 className="text-2xl font-bold text-white">Edit Blog: {blog.title}</h1>
            </div>
            <BlogForm
                blog={blog}
                categories={categories}
                languages={activeLanguages}
                translations={existingTranslations}
            />
        </div>
    );
}
