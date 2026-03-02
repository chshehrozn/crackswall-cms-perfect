"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, MousePointer2, Clock, Globe } from 'lucide-react';
import AnalyticsChart from '@/components/admin/AnalyticsChart';

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [range, setRange] = useState('week');
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000';
            const response = await fetch(`${apiBaseUrl}/api/analytics-stats?range=${range}`);
            const data = await response.json();
            if (data.status) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds for real-time feel
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [range]);

    if (!stats && loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const cards = [
        { label: 'Real-time Views', value: stats?.realtime || 0, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Total Views', value: stats?.stats?.reduce((acc, curr) => acc + curr.views, 0) || 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Unique Visitors', value: stats?.stats?.reduce((acc, curr) => acc + curr.visitors, 0) || 0, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
    ];

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-white/50 text-sm mt-1">Real-time traffic and historical data</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    {['day', 'week', 'month', 'year'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${range === r ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {cards.map(c => (
                    <div key={c.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/50 text-sm">{c.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">{c.value.toLocaleString()}</p>
                            </div>
                            <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
                                <c.icon size={24} className={c.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-purple-400" />
                        Traffic Trend
                    </h3>
                    <AnalyticsChart data={stats?.stats} height={300} />
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <MousePointer2 size={18} className="text-blue-400" />
                        Top Pages
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="space-y-4">
                            {stats?.top_pages?.map((p, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{p.url}</p>
                                        <div className="w-full bg-white/5 h-1 rounded-full mt-2">
                                            <div
                                                className="bg-purple-600 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${(p.views / (stats.top_pages[0]?.views || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-white/60 text-xs font-medium">{p.views.toLocaleString()}</span>
                                </div>
                            ))}
                            {(!stats?.top_pages || stats.top_pages.length === 0) && (
                                <p className="text-white/20 text-center py-8 text-sm italic">Passive tracking...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
