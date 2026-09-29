import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { Users, Clock, Wallet, KeyRound, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    // Simulated countdown timer for the side showcase
    const [seconds, setSeconds] = useState(3 * 3600 + 14 * 60 + 25);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSec: number) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[#0e0f12] text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-900/15 via-purple-900/10 to-amber-900/10 blur-[140px] pointer-events-none rounded-full" />

            {/* Main Auth Container Card */}
            <div className="w-full max-w-4xl bg-zinc-900/90 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl relative z-10">
                
                {/* Left Side Showcase Banner (Visible on LG screens) */}
                <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-8 flex-col justify-between border-r border-zinc-800/80 relative">
                    <div className="space-y-6">
                        {/* Logo */}
                        <Link href={home()} className="inline-flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">ShareRoom</span>
                        </Link>

                        <div className="space-y-2 pt-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-300">
                                <Sparkles className="w-3 h-3 text-amber-400" /> Web Shared Room
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-snug">
                                Chat Sementara & Dompet Kas Bareng
                            </h2>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Nikmati kemudahan nongkrong tanpa beban memori HP. Otomatis hapus saat waktu abis!
                            </p>
                        </div>

                        {/* Interactive Feature Mini Card Showcase */}
                        <div className="space-y-3 pt-2">
                            {/* Live Timer Preview */}
                            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    <span className="text-zinc-300 font-medium">Auto-Destruct:</span>
                                </div>
                                <span className="font-mono font-bold text-amber-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                                    {formatTime(seconds)}
                                </span>
                            </div>

                            {/* Kode Room Preview */}
                            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-amber-400" />
                                    <span className="text-zinc-300 font-medium">Akses Unik:</span>
                                </div>
                                <span className="font-mono font-bold text-white bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 tracking-wider">
                                    SR-8849
                                </span>
                            </div>

                            {/* Wallet Preview */}
                            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-emerald-400" />
                                    <span className="text-zinc-300 font-medium">Kas Room:</span>
                                </div>
                                <span className="font-mono font-bold text-emerald-400">
                                    Rp 185.000
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-900 text-[11px] text-zinc-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Privasi Aman & Tanpa Log Permanen
                    </div>
                </div>

                {/* Right Side Form Content */}
                <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
                    {/* Mobile Header Logo */}
                    <div className="lg:hidden flex items-center justify-between pb-6 mb-4 border-b border-zinc-800">
                        <Link href={home()} className="inline-flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-lg text-white">ShareRoom</span>
                        </Link>
                    </div>

                    {/* Page Title & Subtitle Header */}
                    <div className="space-y-1 mb-6">
                        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-xs sm:text-sm text-zinc-400">{description}</p>
                        )}
                    </div>

                    {/* Form Component Container */}
                    <div className="w-full">
                        {children}
                    </div>
                </div>

            </div>
        </div>
    );
}
