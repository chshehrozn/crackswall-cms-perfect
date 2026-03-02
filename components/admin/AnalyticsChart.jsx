"use client";

import React from 'react';

export default function AnalyticsChart({ data = [], height = 200, color = "#9333ea" }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center bg-white/5 rounded-2xl" style={{ height }}>
                <p className="text-white/30 text-sm">No data available</p>
            </div>
        );
    }

    const maxVal = Math.max(...data.map(d => d.views), 1);
    const padding = 20;
    const chartWidth = 800;
    const chartHeight = height - (padding * 2);

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * chartWidth;
        const y = chartHeight - (d.views / maxVal) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="relative" style={{ height: chartHeight + padding * 2 }}>
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(p => (
                        <line
                            key={p}
                            x1="0"
                            y1={chartHeight * p}
                            x2={chartWidth}
                            y2={chartHeight * p}
                            stroke="white"
                            strokeOpacity="0.05"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Area */}
                    <polyline
                        points={areaPoints}
                        fill={color}
                        fillOpacity="0.1"
                    />

                    {/* Line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    {/* Dots */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1 || 1)) * chartWidth;
                        const y = chartHeight - (d.views / maxVal) * chartHeight;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                fill={color}
                                className="hover:r-6 cursor-pointer transition-all"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-4">
                {data.filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)).map((d, i) => (
                    <span key={i} className="text-white/40 text-[10px] uppercase tracking-wider">
                        {d.date}
                    </span>
                ))}
            </div>
        </div>
    );
}
