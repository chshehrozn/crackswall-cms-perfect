'use client';
import { LogOut, ExternalLink, Menu } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminTopbar({ siteName, frontendUrl, onMenuClick }) {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/admin/login');
    };

    return (
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
            {/* Mobile Left: Menu Toggle & Title */}
            <div className="flex lg:hidden items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-white/60 hover:text-white transition"
                >
                    <Menu size={24} />
                </button>
                <span className="font-bold text-sm tracking-tight text-white">{siteName}</span>
            </div>

            {/* Desktop Left: Empty (Sidebar handles logo) or breadcrumbs later */}
            <div className="hidden lg:block flex-1">
                {/* Optional: Add search or breadcrumbs here in future */}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 ml-auto">
                <Link href={frontendUrl || 'http://localhost:3001'} target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition shadow-sm">
                    <ExternalLink size={16} className="text-white/60" />
                    <span className="hidden sm:inline">Live Site</span>
                </Link>
                <button onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-medium transition shadow-sm">
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
