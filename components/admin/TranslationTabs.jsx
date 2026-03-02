'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';

export default function TranslationTabs({ languages, translations = [], tableName, rowId, defaultValues = {} }) {
    const [activeTab, setActiveTab] = useState('en');

    // Helper to get translation value for a specific field and locale
    const getTranslation = (columnName, locale) => {
        if (locale === 'en') return defaultValues[columnName] || '';
        const t = translations.find(item => item.locale === locale && item.column_name === columnName);
        return t ? t.value : '';
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
                {languages.map(lang => (
                    <button
                        key={lang.locale}
                        type="button"
                        onClick={() => setActiveTab(lang.locale)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${activeTab === lang.locale
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                            }`}
                    >
                        <Globe size={14} className={activeTab === lang.locale ? 'text-white' : 'text-white/30'} />
                        {lang.name}
                    </button>
                ))}
            </div>

            {/* Content for Active Tab */}
            <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
                {languages.map(lang => {
                    const l = lang.locale;
                    return (
                        <div key={l} className={`space-y-6 ${activeTab === l ? 'block' : 'hidden'}`}>
                            {/* Title Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">
                                    {lang.name} Title {l === 'en' && <span className="text-red-400">*</span>}
                                </label>
                                <input
                                    type="text"
                                    name={l === 'en' ? 'title' : `title_${l}`}
                                    required={l === 'en'}
                                    defaultValue={getTranslation('title', l)}
                                    placeholder={`${lang.name} title...`}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {/* SEO Title Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">{lang.name} SEO Title</label>
                                <input
                                    type="text"
                                    name={l === 'en' ? 'seo_title' : `seo_title_${l}`}
                                    defaultValue={getTranslation('seo_title', l)}
                                    placeholder={`${lang.name} SEO title...`}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">{lang.name} Description</label>
                                <textarea
                                    name={l === 'en' ? 'description' : `description_${l}`}
                                    rows={4}
                                    defaultValue={getTranslation('description', l)}
                                    placeholder={`${lang.name} description...`}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition custom-scrollbar resize-none"
                                ></textarea>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
