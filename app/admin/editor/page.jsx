'use client';
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Folder, FileText, ChevronLeft, Save, Loader2, Code2, AlertTriangle, Lock } from 'lucide-react';

export default function CodeEditorAdmin() {
    const [currentPath, setCurrentPath] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [unlocked, setUnlocked] = useState(false);
    const [pin, setPin] = useState('');
    const [pinInput, setPinInput] = useState('');
    const [unlocking, setUnlocking] = useState(false);
    const [unlockError, setUnlockError] = useState('');

    const verifyPin = async (e) => {
        e.preventDefault();
        setUnlocking(true);
        setUnlockError('');
        try {
            const res = await fetch('/api/admin/verify-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: pinInput })
            });
            const data = await res.json();
            if (data.success) {
                setPin(pinInput);
                setUnlocked(true);
            } else {
                setUnlockError(data.message || 'Invalid PIN');
            }
        } catch {
            setUnlockError('Server error');
        }
        setUnlocking(false);
    };

    useEffect(() => {
        if (unlocked) loadPath(currentPath);
    }, [currentPath, unlocked]);

    const loadPath = async (path) => {
        if (!unlocked) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/files?path=' + encodeURIComponent(path), {
                headers: { 'x-admin-pin': pin }
            });
            const data = await res.json();
            if (data.status) {
                if (data.isDirectory) {
                    setFiles(data.files);
                    setSelectedFile(null); // Deselect file if we navigated to a dir
                } else {
                    setSelectedFile(path);
                    setFileContent(data.content || '');
                    setOriginalContent(data.content || '');
                }
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Failed to load', type: 'error' });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!selectedFile || fileContent === originalContent) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
                body: JSON.stringify({ path: selectedFile, content: fileContent })
            });
            const data = await res.json();
            if (data.status) {
                setMessage({ text: 'File saved successfully.', type: 'success' });
                setOriginalContent(fileContent);
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Failed to save', type: 'error' });
        }
        setSaving(false);
    };

    const goBack = () => {
        if (!currentPath) return; // At root
        const parts = currentPath.split('/');
        parts.pop();
        setCurrentPath(parts.join('/'));
    };

    const isModified = fileContent !== originalContent;
    const language = selectedFile?.endsWith('.js') || selectedFile?.endsWith('.jsx') ? 'javascript' :
        selectedFile?.endsWith('.css') ? 'css' :
            selectedFile?.endsWith('.json') ? 'json' :
                selectedFile?.endsWith('.html') ? 'html' : 'plaintext';

    if (!unlocked) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} />
                </div>
                <h2 className="text-xl font-bold text-white text-center mb-2">Editor Locked</h2>
                <p className="text-white/50 text-sm text-center mb-6">Enter your Developer PIN to access source code.</p>
                <form onSubmit={verifyPin} className="space-y-4">
                    <input
                        type="password"
                        maxLength={6}
                        autoFocus
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="••••"
                    />
                    {unlockError && <p className="text-red-400 text-sm text-center">{unlockError}</p>}
                    <button
                        type="submit"
                        disabled={unlocking || pinInput.length < 4}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {unlocking ? <Loader2 size={20} className="animate-spin" /> : 'Unlock Editor'}
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 flex flex-col h-[calc(100vh-64px)] lg:h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Code2 className="text-indigo-400" /> Code Editor
                    </h1>
                    <p className="text-white/50 text-sm mt-1">Directly edit application files</p>
                </div>

                <div className="flex items-center gap-4">
                    {message.text && (
                        <span className={`text-sm font-medium animate-in fade-in slide-in-from-right-4 ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {message.text}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!selectedFile || !isModified || saving || loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 border border-white/10 rounded-2xl flex flex-col md:flex-row overflow-hidden min-h-0">

                {/* File Explorer Sidebar */}
                <div className="w-full md:w-64 bg-slate-950 border-r border-white/10 flex flex-col shrink-0 h-48 md:h-auto border-b md:border-b-0">
                    <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2 shrink-0">
                        <button
                            onClick={goBack}
                            disabled={!currentPath}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-30 transition rounded"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-medium text-white/70 truncate flex-1" title={'/' + currentPath}>
                            /{currentPath || ' root'}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {loading && !selectedFile ? (
                            <div className="flex items-center justify-center py-8 text-white/30">
                                <Loader2 size={24} className="animate-spin" />
                            </div>
                        ) : (
                            <ul className="space-y-0.5">
                                {files.map(f => (
                                    <li key={f.path}>
                                        <button
                                            onClick={() => f.isDirectory ? setCurrentPath(f.path) : loadPath(f.path)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition truncate
                                                ${selectedFile === f.path ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                                            `}
                                        >
                                            {f.isDirectory ? <Folder size={16} className="text-blue-400 shrink-0" /> : <FileText size={16} className="text-slate-400 shrink-0" />}
                                            <span className="truncate">{f.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                    {selectedFile ? (
                        <>
                            <div className="px-4 py-2 bg-[#252526] text-white/60 text-xs flex justify-between items-center shrink-0 shadow-md z-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-400">{selectedFile}</span>
                                    {isModified && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                                </div>
                                <span className="uppercase text-[10px] font-bold tracking-wider">{language}</span>
                            </div>
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    language={language}
                                    theme="vs-dark"
                                    value={fileContent}
                                    onChange={(val) => setFileContent(val)}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        wordWrap: 'on',
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                        smoothScrolling: true,
                                    }}
                                    loading={<div className="flex justify-center items-center h-full text-white/30"><Loader2 size={32} className="animate-spin" /></div>}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4 p-8 text-center bg-slate-900 border-l border-white/5">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                <Code2 size={32} className="text-white/20" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">No file selected</h3>
                                <p className="text-sm">Select a file from the explorer on the left to start editing.</p>
                            </div>
                            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-sm flex items-start gap-3 text-left">
                                <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-200/70">
                                    <strong>Be Careful:</strong> You are editing live project files. A syntax error could crash the server. Only edit code if you know what you are doing.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
