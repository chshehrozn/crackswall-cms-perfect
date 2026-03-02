'use client';
import { useState } from 'react';
import { Package } from 'lucide-react';

export default function DashboardImageFallback({ src, alt, className }) {
    const [error, setError] = useState(!src);

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-white/5 border border-white/10 text-white/40 ${className}`}>
                <Package size={20} />
            </div>
        );
    }

    return (
        <img
            src={src.startsWith('http') ? src : `/${src.replace(/^public\//, '')}`}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    );
}
