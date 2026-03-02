export const metadata = { title: 'CMS Setup Wizard' };

export default function SetupLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                {/* Logo / Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 mb-4 shadow-2xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">CracksWall CMS</h1>
                    <p className="text-purple-300 mt-1">Setup Wizard</p>
                </div>
                {children}
            </div>
        </div>
    );
}
