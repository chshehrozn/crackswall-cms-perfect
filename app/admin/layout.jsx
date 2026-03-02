"use client";
import Sidebar from '@/components/admin/Sidebar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin/Topbar';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [site, setSite] = useState({ name: '' });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isLoginPage = pathname === '/admin/login';

    const [frontendUrl, setFrontendUrl] = useState(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://fe.claynestltd.shop');

    useEffect(() => {
        // If ENV is already set, don't bother with cookies
        if (process.env.NEXT_PUBLIC_FRONTEND_URL) return;

        const cookies = document.cookie.split('; ');
        const feCookie = cookies.find(row => row.startsWith('cms_frontend_url='));

        if (feCookie) {
            setFrontendUrl(decodeURIComponent(feCookie.split('=')[1]));
        } else {
            // Fallback to deriving from API URL if feasible, or just keep default
            const urlCookie = cookies.find(row => row.startsWith('cms_api_url='));
            if (urlCookie) {
                const url = decodeURIComponent(urlCookie.split('=')[1]).replace(/\/api$/, '').replace(/\/$/, '');
                setFrontendUrl(url);
            }
        }
    }, []);

    useEffect(() => {
        // Close sidebar on navigation (mobile)
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        fetch('/api/theme')
            .then(res => res.json())
            .then(json => {
                if (json.site) {
                    // Resolve relative image paths to frontend URL
                    const site = { ...json.site };
                    if (site.logo && !site.logo.startsWith('http')) {
                        site.logo = `${frontendUrl}${site.logo}`;
                    }
                    if (site.favicon && !site.favicon.startsWith('http')) {
                        site.favicon = `${frontendUrl}${site.favicon}`;
                    }
                    setSite(site);
                }
            })
            .catch(() => { });
    }, []);

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar site={site} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Global Topbar */}
                <AdminTopbar siteName={site?.name || 'Dashboard'} frontendUrl={frontendUrl} onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
