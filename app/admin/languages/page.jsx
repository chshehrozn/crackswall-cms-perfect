import { query } from '@/lib/db';
import { toggleLanguageStatus } from './actions';
import { Globe, CheckCircle, XCircle } from 'lucide-react';

export default async function LanguagesAdminPage() {
    let languages = [];
    try {
        languages = await query("SELECT * FROM languages ORDER BY id ASC");
    } catch (e) {
        console.error("Failed to fetch languages:", e);
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Globe className="text-indigo-400" size={24} />
                        Localization & Languages
                    </h1>
                    <p className="text-white/50 text-sm mt-1">Manage enabled translated languages for the frontend URL routing</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Language Name</th>
                                <th className="px-6 py-4 text-left text-white/50 font-medium text-xs uppercase tracking-wide">URL Slug</th>
                                <th className="px-6 py-4 text-left text-white/50 font-medium text-xs uppercase tracking-wide">Status</th>
                                <th className="px-6 py-4 text-right text-white/50 font-medium text-xs uppercase tracking-wide w-[150px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {languages.map((lang) => (
                                <tr key={lang.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Render the SVG Icon string */}
                                            <div
                                                className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center shadow-md shadow-black/20"
                                                dangerouslySetInnerHTML={{ __html: lang.flag_icon }}
                                            />
                                            <p className="text-white font-medium text-base">{lang.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-white/10 text-white/70 font-mono text-xs px-2 py-1 rounded inline-flex items-center">
                                            /{lang.locale}/...
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {lang.status === 'Active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-white/40 text-xs font-medium rounded-full border border-white/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                                Disabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <form action={toggleLanguageStatus.bind(null, lang.id, lang.status)}>
                                            <button
                                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ml-auto ${lang.status === 'Active'
                                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                                        : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                    }`}
                                            >
                                                {lang.status === 'Active' ? 'Disable' : 'Enable'}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {languages.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-white/30 flex flex-col items-center gap-3">
                                        <Globe size={40} className="text-white/10" />
                                        No languages found in database
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
