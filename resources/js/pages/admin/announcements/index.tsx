import { Head, router, useForm, usePoll } from '@inertiajs/react';
import { showConfirmDialog } from '@/lib/swal';
import {
    Megaphone,
    PlusCircle,
    Trash2,
    CheckCircle2,
    XCircle,
    Pin,
    Sparkles,
    Gift,
    AlertTriangle,
    Info,
    X,
    FileText,
    Wrench,
    Rocket,
    ShieldAlert
} from 'lucide-react';
import { useState } from 'react';

interface AnnouncementAdminData {
    id: number;
    title: string;
    category: 'info' | 'update' | 'promo' | 'warning';
    content: string;
    is_pinned: boolean;
    is_active: boolean;
    author_name: string;
    created_at: string;
}

interface AdminAnnouncementsIndexProps {
    announcements: AnnouncementAdminData[];
}

export default function AdminAnnouncementsIndex({ announcements }: AdminAnnouncementsIndexProps) {
    // Real-Time Sync for Global Announcements
    usePoll(3000, {
        only: ['announcements']
    }, {
        keepAlive: true
    });
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        title: '',
        category: 'info' as 'info' | 'update' | 'promo' | 'warning',
        content: '',
        is_pinned: false,
        is_active: true,
    });

    const quickTemplates = [
        {
            id: 'maintenance',
            label: 'Maintenance / Perawatan',
            icon: Wrench,
            color: 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20',
            data: {
                title: 'Pemberitahuan Pemeliharaan Sistem (Scheduled Maintenance)',
                category: 'warning' as const,
                content: `Halo Pengguna ShareRoom,\n\nKami akan melakukan pemeliharaan sistem rutin pada [Hari, Tanggal] pukul [00:00 WIB]. Selama proses maintenance berlangsung, akses layanan transaksi dan room mungkin akan terganggu sementara.\n\nMohon maaf atas ketidaknyamanan ini. Terima kasih atas pengertian Anda!`,
                is_pinned: true,
                is_active: true,
            },
        },
        {
            id: 'release',
            label: 'Rilis Fitur Baru',
            icon: Rocket,
            color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20',
            data: {
                title: 'Update Fitur Baru ShareRoom Telah Hadir!',
                category: 'update' as const,
                content: `Halo Pengguna ShareRoom,\n\nKami sangat senang mengumumkan bahwa fitur [Nama Fitur Baru] telah resmi dirilis! Fitur ini memungkinkan Anda untuk mengelola kas room dan bertransaksi dengan lebih cepat dan aman.\n\nCobalah fitur baru ini sekarang di dashboard Anda!`,
                is_pinned: false,
                is_active: true,
            },
        },
        {
            id: 'promo',
            label: 'Event / Diskon Promo',
            icon: Gift,
            color: 'bg-[#008080]/10 text-[#008080] border-[#008080]/30 hover:bg-[#008080]/20',
            data: {
                title: 'Promo Spesial Top Up Dompet Kas Room!',
                category: 'promo' as const,
                content: `Halo Pengguna ShareRoom,\n\nDapatkan diskon potongan harga spesial saat top up kas room menggunakan kode promo: [KODE_PROMO]. Nikmati potongan hingga [Nilai Diskon]%!\n\nPromo ini berlaku terbatas hingga [Tanggal Berakhir]. Jangan sampai ketinggalan!`,
                is_pinned: true,
                is_active: true,
            },
        },
        {
            id: 'security',
            label: 'Peringatan Keamanan',
            icon: ShieldAlert,
            color: 'bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20',
            data: {
                title: 'Himbauan Waspada Penipuan & Keamanan Akun',
                category: 'warning' as const,
                content: `Halo Pengguna ShareRoom,\n\nHarap selalu berhati-hati terhadap pihak tidak bertanggung jawab yang mengatasnamakan Tim Admin ShareRoom. Kami tidak pernah meminta kata sandi, kode OTP, atau transfer ke rekening pribadi.\n\nJika menemukan kejanggalan, segera laporkan ke pihak kami!`,
                is_pinned: false,
                is_active: true,
            },
        },
    ];

    const applyTemplate = (templateData: typeof quickTemplates[0]['data']) => {
        form.setData({
            title: templateData.title,
            category: templateData.category,
            content: templateData.content,
            is_pinned: templateData.is_pinned,
            is_active: templateData.is_active,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/announcements', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setShowModal(false);
            },
        });
    };

    const handleToggleStatus = (annId: number, title: string, currentStatus: boolean) => {
        const actionStr = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
        showConfirmDialog({
            title: `${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)} Pengumuman?`,
            text: `Apakah Anda yakin ingin ${actionStr} pengumuman "${title}"?`,
            confirmButtonText: 'Ya, Ubah Status',
            cancelButtonText: 'Batal',
            icon: 'info',
        }, () => {
            router.post(`/admin/announcements/${annId}/toggle-status`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleTogglePin = (annId: number, title: string, currentPin: boolean) => {
        const actionStr = currentPin ? 'melepas sematan' : 'menyematkan (pin)';
        showConfirmDialog({
            title: `${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)} Pengumuman?`,
            text: `Apakah Anda yakin ingin ${actionStr} pengumuman "${title}" di bagian teratas feed user?`,
            confirmButtonText: 'Ya, Ubah Sematan',
            cancelButtonText: 'Batal',
            icon: 'info',
        }, () => {
            router.post(`/admin/announcements/${annId}/toggle-pin`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleDelete = (annId: number, title: string) => {
        showConfirmDialog({
            title: `Hapus Pengumuman?`,
            text: `Pengumuman "${title}" akan dihapus permanen dari sistem.`,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'error',
        }, () => {
            router.delete(`/admin/announcements/${annId}`, {
                preserveScroll: true,
            });
        });
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'update':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                        <Sparkles className="w-3 h-3" /> Pembaruan
                    </span>
                );
            case 'promo':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#008080]/10 border border-[#008080]/20 text-[#008080] dark:text-[#008080] text-[11px] font-semibold">
                        <Gift className="w-3 h-3" /> Event/Promo
                    </span>
                );
            case 'warning':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Peringatan
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-[11px] font-semibold">
                        <Info className="w-3 h-3" /> Info Umum
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Manajemen Pengumuman — ShareRoom Admin" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background dark:bg-[#0e0f12] text-foreground dark:text-zinc-100 min-h-screen">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008080]/10 border border-[#008080]/20 text-[#008080] dark:text-[#008080] text-xs font-semibold">
                            <Megaphone className="w-3.5 h-3.5" /> Informasi Global & Pengumuman
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
                            Manajemen Pengumuman ({announcements?.length || 0})
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400">
                            Buat dan kirim pengumuman resmi atau gunakan Template Cepat (Maintenance, Pembaruan, Promo, Peringatan) untuk mengabari seluruh pengguna.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-[#008080] hover:bg-[#008080]/90 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#008080]/20"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>+ Buat Pengumuman Baru</span>
                    </button>
                </div>

                {/* Quick Template Selector Chips Bar */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground dark:text-white">
                        <FileText className="w-4 h-4 text-[#008080]" />
                        <span>Template Cepat Pengumuman Admin:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {quickTemplates.map((tpl) => (
                            <button
                                key={tpl.id}
                                onClick={() => {
                                    applyTemplate(tpl.data);
                                    setShowModal(true);
                                }}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${tpl.color}`}
                            >
                                <tpl.icon className="w-3.5 h-3.5" />
                                <span>{tpl.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modal Form Create Announcement */}
                {showModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-[#008080]" /> Buat Pengumuman Baru
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Quick Template Inside Modal */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Gunakan Template Cepat:
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {quickTemplates.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => applyTemplate(tpl.data)}
                                            className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-secondary-foreground text-[11px] font-medium transition-colors flex items-center gap-1 border border-border"
                                        >
                                            <tpl.icon className="w-3 h-3" />
                                            <span>{tpl.label.split(' ')[1]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div className="space-y-1">
                                    <label className="font-semibold text-foreground dark:text-zinc-300">
                                        Judul Pengumuman <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Pemberitahuan Maintenance Sistem"
                                        value={form.data.title}
                                        onChange={e => form.setData('title', e.target.value)}
                                        required
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-medium focus:outline-none focus:border-[#007BFF]"
                                    />
                                    {form.errors.title && <p className="text-rose-500 text-[11px] mt-1">{form.errors.title}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-foreground dark:text-zinc-300">
                                        Kategori Pengumuman <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.data.category}
                                        onChange={e => form.setData('category', e.target.value as any)}
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-foreground dark:text-white focus:outline-none focus:border-[#007BFF]"
                                    >
                                        <option value="info">Informasi Umum (Info)</option>
                                        <option value="update">Pembaruan Sistem (Update)</option>
                                        <option value="promo">Promo / Event (Promo)</option>
                                        <option value="warning">Peringatan / Maintenance (Warning)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-foreground dark:text-zinc-300">
                                        Isi Pengumuman / Pesan <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Tuliskan isi pengumuman secara rinci di sini..."
                                        value={form.data.content}
                                        onChange={e => form.setData('content', e.target.value)}
                                        required
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl p-4 text-xs text-foreground dark:text-white focus:outline-none focus:border-[#007BFF] resize-y"
                                    />
                                    {form.errors.content && <p className="text-rose-500 text-[11px] mt-1">{form.errors.content}</p>}
                                </div>

                                <div className="flex items-center gap-6 pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_pinned}
                                            onChange={e => form.setData('is_pinned', e.target.checked)}
                                            className="rounded border-border text-[#008080] focus:ring-[#007BFF]"
                                        />
                                        <span className="font-semibold text-foreground dark:text-zinc-300 flex items-center gap-1">
                                            <Pin className="w-3.5 h-3.5 text-[#008080]" /> Sematkan di Teratas (Pin)
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={e => form.setData('is_active', e.target.checked)}
                                            className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="font-semibold text-foreground dark:text-zinc-300">
                                            Langsung Publikasikan (Aktif)
                                        </span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-xl border border-border dark:border-zinc-800 font-semibold text-muted-foreground hover:text-foreground"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="px-5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-semibold shadow-md shadow-teal-900/20"
                                    >
                                        Publikasikan Pengumuman
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Card List Mobile View */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                    {announcements?.map((ann) => (
                        <div key={ann.id} className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <div className="font-bold text-foreground dark:text-white text-sm">
                                        {ann.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        {ann.author_name} • {ann.created_at}
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {getCategoryBadge(ann.category)}
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-3 bg-secondary/30 p-2.5 rounded-lg border border-border/50">
                                {ann.content}
                            </p>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleTogglePin(ann.id, ann.title, ann.is_pinned)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                            ann.is_pinned
                                                ? 'bg-[#008080]/10 text-[#008080] dark:text-[#008080] border-[#008080]/20'
                                                : 'bg-secondary text-muted-foreground border-border'
                                        }`}
                                    >
                                        <Pin className="w-3 h-3" />
                                        <span>{ann.is_pinned ? 'Pinned' : 'Biasa'}</span>
                                    </button>

                                    <button
                                        onClick={() => handleToggleStatus(ann.id, ann.title, ann.is_active)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                            ann.is_active
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                        }`}
                                    >
                                        {ann.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                                        <span>{ann.is_active ? 'Aktif' : 'Draft'}</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleDelete(ann.id, ann.title)}
                                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-medium transition-colors inline-flex items-center gap-1 text-xs"
                                    title="Hapus Pengumuman"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                    {(!announcements || announcements.length === 0) && (
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-xl p-6 text-center text-muted-foreground text-xs">
                            Belum ada pengumuman yang dibuat oleh Admin.
                        </div>
                    )}
                </div>

                {/* Table Announcement List Desktop */}
                <div className="hidden md:block bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="text-muted-foreground bg-background dark:bg-zinc-950 border-b border-border dark:border-zinc-800 font-medium uppercase tracking-wider">
                                <tr>
                                    <th className="p-3.5">Judul & Isi</th>
                                    <th className="p-3.5">Kategori</th>
                                    <th className="p-3.5">Penulis & Tanggal</th>
                                    <th className="p-3.5">Sematan</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-zinc-800/60">
                                {announcements?.map((ann) => (
                                    <tr key={ann.id} className="hover:bg-background/50 dark:hover:bg-zinc-950/50 transition-colors">
                                        <td className="p-3.5 max-w-md space-y-1">
                                            <div className="font-bold text-foreground dark:text-white text-sm">
                                                {ann.title}
                                            </div>
                                            <div className="text-muted-foreground text-xs line-clamp-2">
                                                {ann.content}
                                            </div>
                                        </td>
                                        <td className="p-3.5">
                                            {getCategoryBadge(ann.category)}
                                        </td>
                                        <td className="p-3.5 text-muted-foreground space-y-0.5">
                                            <div className="font-semibold text-foreground dark:text-zinc-200">{ann.author_name}</div>
                                            <div className="font-mono text-[11px]">{ann.created_at}</div>
                                        </td>
                                        <td className="p-3.5">
                                            <button
                                                onClick={() => handleTogglePin(ann.id, ann.title, ann.is_pinned)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                                    ann.is_pinned
                                                        ? 'bg-[#008080]/10 text-[#008080] dark:text-[#008080] border-[#008080]/20 hover:bg-[#008080]/20'
                                                        : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                                                }`}
                                            >
                                                <Pin className="w-3 h-3" />
                                                <span>{ann.is_pinned ? 'Pinned' : 'Biasa'}</span>
                                            </button>
                                        </td>
                                        <td className="p-3.5">
                                            <button
                                                onClick={() => handleToggleStatus(ann.id, ann.title, ann.is_active)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                                    ann.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                                }`}
                                            >
                                                {ann.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                                                <span>{ann.is_active ? 'Aktif' : 'Draft/Nonaktif'}</span>
                                            </button>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <button
                                                onClick={() => handleDelete(ann.id, ann.title)}
                                                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-medium transition-colors inline-flex items-center gap-1"
                                                title="Hapus Pengumuman"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!announcements || announcements.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            Belum ada pengumuman yang dibuat oleh Admin.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminAnnouncementsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Pengumuman',
            href: '/admin/announcements',
        },
    ],
};
