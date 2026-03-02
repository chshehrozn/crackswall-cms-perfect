'use client';
import { useState, useEffect } from 'react';
import { Trash2, AlertOctagon, ExternalLink } from 'lucide-react';

export default function ReportsPage() {
    const [frontendUrl, setFrontendUrl] = useState('http://localhost:3000');

    useEffect(() => {
        const cookies = document.cookie.split('; ');
        const urlCookie = cookies.find(row => row.startsWith('cms_api_url='));
        if (urlCookie) {
            const url = decodeURIComponent(urlCookie.split('=')[1]).replace(/\/api$/, '').replace(/\/$/, '');
            setFrontendUrl(url);
        }
    }, []);

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/admin/reports');
            const data = await res.json();
            if (data.status) {
                setReports(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        try {
            const res = await fetch(`/api/admin/reports?id=${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.status) {
                setReports(reports.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex animate-pulse flex-col gap-4 p-4 md:p-8">
                <div className="h-10 bg-slate-800 rounded w-1/4"></div>
                <div className="h-64 bg-slate-800 rounded w-full mt-4"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <AlertOctagon className="text-indigo-400" /> Dead Link Reports
                </h1>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-white/70 whitespace-nowrap min-w-[700px]">
                    <thead className="bg-white/5 text-white font-semibold">
                        <tr>
                            <th className="px-6 py-4">Software</th>
                            <th className="px-6 py-4">Issue Description</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <tr key={report.id} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{report.blog_title || 'Unknown'} {report.software_version}</div>
                                        <a href={`${frontendUrl}/software/${report.blog_slug}`} target="_blank" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mt-1">
                                            View Post <ExternalLink size={12} />
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal break-words max-w-sm">
                                        <span className="text-white bg-red-500/10 text-red-400 px-2 py-1 rounded inline-block text-xs font-semibold mb-1">
                                            {report.status}
                                        </span>
                                        <p className="text-xs mt-1 text-white/80">{report.reason}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                                            title="Delete & Resolve"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-white/40">
                                    No dead links reported.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
