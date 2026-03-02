import PageForm from '@/components/admin/PageForm';
import Link from 'next/link';

export default function NewPage() {
    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/pages" className="text-white/50 hover:text-white transition">
                    ← Back
                </Link>
                <h1 className="text-2xl font-bold text-white">Write New Page</h1>
            </div>
            <PageForm page={null} />
        </div>
    );
}
