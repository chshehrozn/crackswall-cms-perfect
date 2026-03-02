'use client';
import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, Trash2, ArrowRight, Lock, Loader2 } from 'lucide-react';

export default function TerminalAdmin() {
    const [command, setCommand] = useState('');
    const [history, setHistory] = useState([
        { type: 'system', text: 'Welcome to the Web Terminal. Type a command and press Enter.' },
        { type: 'system', text: 'Warning: You are running commands directly on the server. Proceed with caution.' }
    ]);
    const [running, setRunning] = useState(false);
    const endRef = useRef(null);
    const inputRef = useRef(null);

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

    const runCommand = async (e) => {
        e.preventDefault();
        if (!command.trim() || running) return;

        const cmd = command;
        setCommand('');
        setHistory(prev => [...prev, { type: 'input', text: `root@server:~$ ${cmd}` }]);
        setRunning(true);

        try {
            const res = await fetch('/api/admin/terminal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
                body: JSON.stringify({ command: cmd })
            });
            const data = await res.json();
            setHistory(prev => [...prev, { type: data.status ? 'output' : 'error', text: data.output }]);
        } catch (e) {
            setHistory(prev => [...prev, { type: 'error', text: e.message }]);
        }
        setRunning(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    useEffect(() => {
        if (unlocked) endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, unlocked]);

    if (!unlocked) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} />
                </div>
                <h2 className="text-xl font-bold text-white text-center mb-2">Master Code Required</h2>
                <p className="text-white/50 text-sm text-center mb-6">Enter your 4-6 digit Developer PIN to unlock the web terminal.</p>
                <form onSubmit={verifyPin} className="space-y-4">
                    <input
                        type="password"
                        maxLength={6}
                        autoFocus
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        placeholder="••••"
                    />
                    {unlockError && <p className="text-red-400 text-sm text-center">{unlockError}</p>}
                    <button
                        type="submit"
                        disabled={unlocking || pinInput.length < 4}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {unlocking ? <Loader2 size={20} className="animate-spin" /> : 'Unlock Terminal'}
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
                        <TerminalIcon className="text-emerald-400" /> Web Terminal
                    </h1>
                    <p className="text-white/50 text-sm mt-1 flex items-center gap-2">
                        <ShieldAlert size={14} className="text-amber-400" /> Root-level command execution
                    </p>
                </div>
                <button
                    onClick={() => setHistory([])}
                    className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                >
                    <Trash2 size={16} /> Clear Console
                </button>
            </div>

            <div className="flex-1 bg-black/80 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/50 font-mono text-sm">

                {/* Terminal Header */}
                <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center gap-2 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="ml-4 text-white/40 text-xs">bash - server</span>
                </div>

                {/* Terminal Output */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar" onClick={() => inputRef.current?.focus()}>
                    {history.map((line, i) => (
                        <div key={i} className={`whitespace-pre-wrap break-words ${line.type === 'system' ? 'text-amber-400/80 mb-4' :
                            line.type === 'input' ? 'text-emerald-400 font-bold mt-4' :
                                line.type === 'error' ? 'text-rose-400' :
                                    'text-slate-300'
                            }`}>
                            {line.text}
                        </div>
                    ))}
                    {running && (
                        <div className="text-emerald-400/50 animate-pulse">Running process...</div>
                    )}
                    <div ref={endRef} />
                </div>

                {/* Terminal Input */}
                <form onSubmit={runCommand} className="flex items-center px-4 py-3 bg-white/5 border-t border-white/10 shrink-0">
                    <span className="text-emerald-400 font-bold mr-2 hidden sm:inline">root@server:~$</span>
                    <span className="text-emerald-400 font-bold mr-2 sm:hidden">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        disabled={running}
                        className="flex-1 bg-transparent text-white focus:outline-none disabled:opacity-50"
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <button type="submit" disabled={running || !command.trim()} className="text-white/30 hover:text-white transition disabled:opacity-0 ml-2">
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
