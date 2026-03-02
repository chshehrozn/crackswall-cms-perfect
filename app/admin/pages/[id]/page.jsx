import { queryOne } from '@/lib/db';
import PageForm from '@/components/admin/PageForm';
import Link from 'next/link';

export default async function EditPage({ params }) {
    const { id } = await params;

    let pageData = null;
    try {
        pageData = await queryOne('SELECT * FROM pages WHERE id = ?', [id]);
    } catch (e) {
        console.error(e);
    }

    if (!pageData) {
        return (
            <div className="p-8 text-center text-white/50">
                Page not found.
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/pages" className="text-white/50 hover:text-white transition">
                    ← Back
                </Link>
                <h1 className="text-2xl font-bold text-white">Edit Page: {pageData.title}</h1>
            </div>
            <PageForm page={pageData} />
        </div>
    );
}
