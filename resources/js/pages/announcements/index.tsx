import { Head } from '@inertiajs/react';
import { Megaphone, Pin, Info, Sparkles, Gift, AlertTriangle, Calendar, User } from 'lucide-react';

interface AnnouncementItem {
    id: number;
    title: string;
    category: 'info' | 'update' | 'promo' | 'warning';
    content: string;
    is_pinned: boolean;
    author_name: string;
    date: string;
    time_ago: string;
}

interface AnnouncementsIndexProps {
    announcements: AnnouncementItem[];
}

export default function AnnouncementsIndex({ announcements }: AnnouncementsIndexProps) {
    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'update':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <Sparkles className="w-3 h-3" /> Pembaruan Sistem
                    </span>
                );
            case 'promo':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        <Gift className="w-3 h-3" /> Event / Promo
                    </span>
                );
            case 'warning':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Peringatan
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
                        <Info className="w-3 h-3" /> Informasi Umum
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Pengumuman & Informasi — ShareRoom" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 bg-background dark:bg-[#0e0f12] text-foreground dark:text-zinc-100 min-h-screen">
                {/* Header Page */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                        <Megaphone className="w-3.5 h-3.5" /> Pusat Pengumuman Resmi
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
                        Pengumuman & Informasi Terbaru
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400">
                        Dapatkan informasi terkini mengenai pembaruan platform, fitur baru, maintenance, serta promo spesial ShareRoom dari tim Administrator.
                    </p>
                </div>

                {/* Announcement Timeline Feed */}
                <div className="space-y-4">
                    {announcements.map((ann) => (
                        <div
                            key={ann.id}
                            className={`relative bg-card dark:bg-zinc-900 border ${
                                ann.is_pinned
                                    ? 'border-indigo-500/40 dark:border-indigo-500/40 shadow-md shadow-indigo-500/5'
                                    : 'border-border dark:border-zinc-800'
                            } rounded-2xl p-5 sm:p-6 transition-all space-y-4 hover:border-indigo-500/30`}
                        >
                            {/* Pinned Badge */}
                            {ann.is_pinned && (
                                <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                    <Pin className="w-3 h-3 fill-white" /> Disematkan (Pinned)
                                </div>
                            )}

                            {/* Announcement Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 dark:border-zinc-800/80 pb-3">
                                <div className="flex items-center gap-2">
                                    {getCategoryBadge(ann.category)}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5 text-indigo-500" /> {ann.author_name}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 font-mono">
                                        <Calendar className="w-3.5 h-3.5" /> {ann.date} ({ann.time_ago})
                                    </span>
                                </div>
                            </div>

                            {/* Title & Body */}
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold text-foreground dark:text-white leading-snug">
                                    {ann.title}
                                </h2>
                                <div className="text-xs sm:text-sm text-foreground/90 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                                    {ann.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {announcements.length === 0 && (
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
                            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
                            <h3 className="text-base font-bold text-foreground dark:text-white">
                                Belum Ada Pengumuman
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                Belum ada pengumuman terbaru dari Admin saat ini. Silakan periksa kembali di lain waktu!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AnnouncementsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pengumuman',
            href: '/announcements',
        },
    ],
};
