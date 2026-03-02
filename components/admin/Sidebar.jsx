'use client';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileText,
    Layers,
    Image as ImageIcon,
    MessageSquare,
    Settings,
    FileType,
    AlertOctagon,
    Zap,
    Palette,
    X,
    Code2,
    Terminal,
    Globe,
    TrendingUp
} from 'lucide-react';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/admin/blogs', label: 'Blogs', icon: FileText },
    { href: '/admin/pages', label: 'Pages', icon: FileType },
    { href: '/admin/categories', label: 'Categories', icon: Layers },
    { href: '/admin/media', label: 'Media', icon: ImageIcon },
    { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
    { href: '/admin/reports', label: 'Reports', icon: AlertOctagon },
    { href: '/admin/customize', label: 'Customize', icon: Palette },
    { href: '/admin/editor', label: 'Code Editor', icon: Code2 },
    { href: '/admin/terminal', label: 'Terminal', icon: Terminal },
    { href: '/admin/languages', label: 'Languages', icon: Globe },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ site, isOpen, onClose }) {
    const pathname = usePathname();
    const router = useRouter();
    const siteName = site?.name || 'Admin Panel';
    const siteLogo = site?.logo || null;

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:static lg:h-auto
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* Logo */}
            <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {siteLogo ? (
                        <img src={siteLogo} alt={siteName} className="w-8 h-8 rounded-lg object-contain bg-white/5" />
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <Zap size={18} />
                        </div>
                    )}
                    <div>
                        <div className="text-white font-bold text-sm leading-tight text-wrap">{siteName}</div>
                        <div className="text-white/40 text-xs">CMS Admin</div>
                    </div>
                </div>
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-white/40 hover:text-white lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {NAV.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                    return (
                        <Link key={href} href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}>
                            <Icon size={18} className={active ? 'text-white' : 'text-white/40'} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* View Site + Logout Removed from here (now in Topbar) */}
        </aside>
    );
}
