import { Head, router, useForm, usePoll } from '@inertiajs/react';
import { showConfirmDialog } from '@/lib/swal';
import { 
    Ticket, 
    PlusCircle, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    Percent, 
    Coins, 
    Calendar, 
    Shield, 
    X 
} from 'lucide-react';
import { useState } from 'react';

interface PromoCodeData {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_topup_amount: number;
    max_discount_amount?: number | null;
    is_active: boolean;
    expires_at?: string | null;
    created_at?: string;
}

interface AdminPromosIndexProps {
    promos: PromoCodeData[];
}

export default function AdminPromosIndex({ promos }: AdminPromosIndexProps) {
    // Real-Time Sync for Promo Codes
    usePoll(3000, {
        only: ['promos']
    }, {
        keepAlive: true
    });
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        code: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: '',
        min_topup_amount: '10000',
        max_discount_amount: '',
        expires_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/promos', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setShowModal(false);
            },
        });
    };

    const handleToggleStatus = (promoId: number, code: string, currentStatus: boolean) => {
        const actionStr = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
        showConfirmDialog({
            title: `${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)} Kode Promo?`,
            text: `Apakah Anda yakin ingin ${actionStr} kode promo ${code}?`,
            confirmButtonText: 'Ya, Ubah Status',
            cancelButtonText: 'Batal',
            icon: 'info',
        }, () => {
            router.post(`/admin/promos/${promoId}/toggle`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleDelete = (promoId: number, code: string) => {
        showConfirmDialog({
            title: `Hapus Kode Promo ${code}?`,
            text: 'Kode promo ini akan dihapus secara permanen dari sistem.',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'error',
        }, () => {
            router.delete(`/admin/promos/${promoId}`, {
                preserveScroll: true,
            });
        });
    };

    return (
        <>
            <Head title="Manajemen Kode Promo — ShareRoom Admin" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background dark:bg-[#090d10] text-foreground dark:text-zinc-100 min-h-screen">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008080]/10 border border-[#008080]/20 text-[#008080] dark:text-teal-400 text-xs font-semibold">
                            <Ticket className="w-3.5 h-3.5" /> Diskon & Voucher Top Up
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
                            Manajemen Kode Promo ({promos?.length || 0})
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400">
                            Kelola voucher diskon persentase (%) atau potongan harga tetap (Rp) untuk top up dompet kas room pengguna.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>+ Tambah Kode Promo Baru</span>
                    </button>
                </div>

                {/* Modal Form Tambah Kode Promo */}
                {showModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-emerald-500" /> Buat Kode Promo Baru
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div className="space-y-1">
                                    <label className="font-semibold text-foreground dark:text-zinc-300">
                                        Kode Promo <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: HEMAT50, DISKON5K"
                                        value={form.data.code}
                                        onChange={e => form.setData('code', e.target.value.toUpperCase())}
                                        required
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                                    />
                                    {form.errors.code && <p className="text-rose-500 text-[11px] mt-1">{form.errors.code}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="font-semibold text-foreground dark:text-zinc-300">
                                            Tipe Diskon <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={form.data.type}
                                            onChange={e => form.setData('type', e.target.value as 'percentage' | 'fixed')}
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-foreground dark:text-white focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="percentage">Persentase (%)</option>
                                            <option value="fixed">Potongan Tetap (Rp)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-semibold text-foreground dark:text-zinc-300">
                                            Nilai Diskon <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder={form.data.type === 'percentage' ? 'Misal: 50 (untuk 50%)' : 'Misal: 5000 (untuk Rp 5.000)'}
                                            value={form.data.value}
                                            onChange={e => form.setData('value', e.target.value)}
                                            required
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                                        />
                                        {form.errors.value && <p className="text-rose-500 text-[11px] mt-1">{form.errors.value}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="font-semibold text-foreground dark:text-zinc-300">
                                            Minimal Top Up (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="10000"
                                            value={form.data.min_topup_amount}
                                            onChange={e => form.setData('min_topup_amount', e.target.value)}
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {form.data.type === 'percentage' && (
                                        <div className="space-y-1">
                                            <label className="font-semibold text-foreground dark:text-zinc-300">
                                                Maksimal Diskon (Rp, Opsional)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Misal: 50000"
                                                value={form.data.max_discount_amount}
                                                onChange={e => form.setData('max_discount_amount', e.target.value)}
                                                className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    )}
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
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
                                    >
                                        Simpan Promo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table & Mobile Card Promo Code List */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                    {/* MOBILE CARD VIEW (Visible on small screens) */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {promos?.map((p) => (
                            <div key={p.id} className="bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800/80 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base tracking-wider">
                                        {p.code}
                                    </span>
                                    <button
                                        onClick={() => handleToggleStatus(p.id, p.code, p.is_active)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                            p.is_active
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                        }`}
                                    >
                                        {p.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        <span>{p.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/50 dark:border-zinc-800/50">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Tipe Diskon</span>
                                        {p.type === 'percentage' ? (
                                            <span className="inline-flex items-center gap-1 text-[#008080] dark:text-[#008080] font-bold">
                                                <Percent className="w-3.5 h-3.5" /> Diskon {p.value}%
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                                <Coins className="w-3.5 h-3.5" /> Rp {p.value.toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Min. Top Up</span>
                                        <span className="font-mono text-muted-foreground font-semibold">
                                            Rp {(p.min_topup_amount || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1 text-xs">
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                        Maks Diskon: {p.max_discount_amount ? `Rp ${p.max_discount_amount.toLocaleString('id-ID')}` : 'Tanpa Batas'}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(p.id, p.code)}
                                        className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-medium transition-colors inline-flex items-center gap-1 text-xs"
                                        title="Hapus Kode Promo"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}

                        {(!promos || promos.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground text-xs">
                                Belum ada kode promo yang dibuat oleh Admin.
                            </div>
                        )}
                    </div>

                    {/* DESKTOP TABLE VIEW (Visible on medium+ screens) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="text-muted-foreground bg-background dark:bg-zinc-950 border-b border-border dark:border-zinc-800 font-medium uppercase tracking-wider">
                                <tr>
                                    <th className="p-3.5">Kode Promo</th>
                                    <th className="p-3.5">Tipe & Nilai Diskon</th>
                                    <th className="p-3.5">Syarat Min. Top Up</th>
                                    <th className="p-3.5">Maks. Diskon</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-zinc-800/60">
                                {promos?.map((p) => (
                                    <tr key={p.id} className="hover:bg-background/50 dark:hover:bg-zinc-950/50 transition-colors">
                                        <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tracking-wider">
                                            {p.code}
                                        </td>
                                        <td className="p-3.5 text-foreground dark:text-white font-semibold">
                                            {p.type === 'percentage' ? (
                                                <span className="inline-flex items-center gap-1 text-[#008080] dark:text-[#008080]">
                                                    <Percent className="w-3.5 h-3.5" /> Diskon {p.value}%
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                                                    <Coins className="w-3.5 h-3.5" /> Potongan Rp {p.value.toLocaleString('id-ID')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3.5 text-muted-foreground font-mono">
                                            Rp {(p.min_topup_amount || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-3.5 text-muted-foreground font-mono">
                                            {p.max_discount_amount ? `Rp ${p.max_discount_amount.toLocaleString('id-ID')}` : '-'}
                                        </td>
                                        <td className="p-3.5">
                                            <button
                                                onClick={() => handleToggleStatus(p.id, p.code, p.is_active)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                                    p.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                                }`}
                                            >
                                                {p.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                <span>{p.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                            </button>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            <button
                                                onClick={() => handleDelete(p.id, p.code)}
                                                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-medium transition-colors inline-flex items-center gap-1"
                                                title="Hapus Kode Promo"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!promos || promos.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            Belum ada kode promo yang dibuat oleh Admin.
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

AdminPromosIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Kode Promo',
            href: '/admin/promos',
        },
    ],
};
