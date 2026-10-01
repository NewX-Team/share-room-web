import { Head, router, useForm } from '@inertiajs/react';
import { showConfirmDialog } from '@/lib/swal';
import { 
    Timer, 
    PlusCircle, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Coins, 
    Edit2, 
    Shield, 
    X,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface ExtensionPackageData {
    id: number;
    hours: number;
    price: number;
    is_active: boolean;
    created_at?: string;
}

interface AdminExtensionPackagesProps {
    packages: ExtensionPackageData[];
}

export default function AdminExtensionPackagesIndex({ packages }: AdminExtensionPackagesProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ExtensionPackageData | null>(null);

    const createForm = useForm({
        hours: '1',
        price: '1000',
    });

    const editForm = useForm({
        hours: '1',
        price: '1000',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/extension-packages', {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleOpenEdit = (pkg: ExtensionPackageData) => {
        setEditingPackage(pkg);
        editForm.setData({
            hours: String(pkg.hours),
            price: String(pkg.price),
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPackage) return;

        editForm.post(`/admin/extension-packages/${editingPackage.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingPackage(null);
            },
        });
    };

    const handleToggleStatus = (pkgId: number, hours: number, currentStatus: boolean) => {
        const actionStr = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
        showConfirmDialog({
            title: `${actionStr.charAt(0).toUpperCase() + actionStr.slice(1)} Paket Perpanjangan +${hours} Jam?`,
            text: `Apakah Anda yakin ingin ${actionStr} opsi perpanjangan +${hours} jam ini untuk pengguna?`,
            confirmButtonText: 'Ya, Ubah Status',
            cancelButtonText: 'Batal',
            icon: 'info',
        }, () => {
            router.post(`/admin/extension-packages/${pkgId}/toggle`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleDelete = (pkgId: number, hours: number) => {
        showConfirmDialog({
            title: `Hapus Paket +${hours} Jam?`,
            text: 'Opsi paket perpanjangan waktu ini akan dihapus secara permanen dari sistem.',
            confirmButtonText: 'Ya, Hapus Paket',
            cancelButtonText: 'Batal',
            icon: 'error',
        }, () => {
            router.delete(`/admin/extension-packages/${pkgId}`, {
                preserveScroll: true,
            });
        });
    };

    const activeCount = packages.filter(p => p.is_active).length;

    return (
        <>
            <Head title="Manajemen Paket Perpanjang Room — ShareRoom Admin" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background dark:bg-[#0e0f12] text-foreground dark:text-zinc-100 min-h-screen">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <Timer className="w-3.5 h-3.5" /> Paket Durasi Room (Jam)
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
                            Manajemen Paket Perpanjang Room ({packages?.length || 0})
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400">
                            Atur opsi pilihan durasi jam perpanjangan dan nominal harga kas digital yang harus dibayar oleh room user.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 self-start sm:self-auto"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Tambah Paket Perpanjangan</span>
                    </button>
                </div>

                {/* Summary Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-4 rounded-2xl space-y-1 shadow-sm">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Paket Tersedia</span>
                        <div className="text-2xl font-bold font-mono text-foreground dark:text-white">{packages.length} Opsi</div>
                    </div>
                    <div className="bg-card dark:bg-zinc-900 border border-emerald-500/30 p-4 rounded-2xl space-y-1 shadow-sm">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Paket Aktif Digunakan</span>
                        <div className="text-2xl font-bold font-mono text-emerald-500">{activeCount} Paket</div>
                    </div>
                    <div className="bg-card dark:bg-zinc-900 border border-amber-500/30 p-4 rounded-2xl space-y-1 shadow-sm">
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Status Fitur User</span>
                        <div className="text-sm font-bold text-foreground dark:text-white flex items-center gap-1.5 pt-1">
                            {activeCount > 0 ? (
                                <span className="text-emerald-500 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Aktif di Room Chat
                                </span>
                            ) : (
                                <span className="text-rose-500 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> Non-aktif (0 Paket)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Packages List */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm space-y-4">
                    <div className="p-4 border-b border-border dark:border-zinc-800 flex items-center justify-between">
                        <h3 className="font-bold text-foreground dark:text-white text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-500" /> Daftar Opsi Paket Perpanjangan Waktu
                        </h3>
                    </div>

                    {packages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground space-y-2">
                            <AlertCircle className="w-8 h-8 mx-auto opacity-50 text-amber-500" />
                            <p className="text-xs font-semibold">Belum ada paket perpanjangan durasi room yang dibuat.</p>
                            <p className="text-[11px]">Klik tombol "Tambah Paket Perpanjangan" di atas untuk menambahkan opsi perpanjangan waktu.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-muted/50 dark:bg-zinc-950/50 text-muted-foreground border-b border-border dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="p-4">Durasi Perpanjangan</th>
                                        <th className="p-4">Harga Kas Digital (Rp)</th>
                                        <th className="p-4">Status Opsi</th>
                                        <th className="p-4 text-right">Aksi Manajemen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border dark:divide-zinc-800 font-medium">
                                    {packages.map((pkg) => (
                                        <tr key={pkg.id} className="hover:bg-muted/30 dark:hover:bg-zinc-950/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 font-bold">
                                                        <Clock className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-foreground dark:text-white text-sm flex items-center gap-1">
                                                            +{pkg.hours} Jam
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground block font-mono">
                                                            ({(pkg.hours / 24).toFixed(1)} Hari)
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                    Rp {pkg.price.toLocaleString('id-ID')}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                                    pkg.is_active 
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                }`}>
                                                    {pkg.is_active ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                                                    <span>{pkg.is_active ? 'Aktif Digunakan' : 'Non-aktif'}</span>
                                                </span>
                                            </td>

                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Toggle Status */}
                                                    <button
                                                        onClick={() => handleToggleStatus(pkg.id, pkg.hours, pkg.is_active)}
                                                        className={`px-2.5 py-1.5 rounded-xl font-semibold text-[11px] transition-colors flex items-center gap-1 border ${
                                                            pkg.is_active
                                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                                        }`}
                                                        title={pkg.is_active ? 'Non-aktifkan paket' : 'Aktifkan paket'}
                                                    >
                                                        <span>{pkg.is_active ? 'Non-aktifkan' : 'Aktifkan'}</span>
                                                    </button>

                                                    {/* Edit Package */}
                                                    <button
                                                        onClick={() => handleOpenEdit(pkg)}
                                                        className="px-2.5 py-1.5 rounded-xl font-semibold text-[11px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors flex items-center gap-1"
                                                        title="Edit paket"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        <span>Edit</span>
                                                    </button>

                                                    {/* Delete Package */}
                                                    <button
                                                        onClick={() => handleDelete(pkg.id, pkg.hours)}
                                                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-border dark:border-zinc-800 hover:border-rose-500/30 transition-colors"
                                                        title="Hapus paket"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MODAL CREATE PAKET */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-indigo-500" /> Tambah Paket Perpanjangan Room
                                </h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-foreground dark:text-zinc-200">
                                        Durasi Penambahan Waktu (Jam)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="720"
                                            value={createForm.data.hours}
                                            onChange={e => createForm.setData('hours', e.target.value)}
                                            placeholder="1"
                                            required
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground text-xs">
                                            Jam
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Contoh: 1 (untuk 1 jam), 3 (untuk 3 jam), 24 (untuk 24 jam).</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-foreground dark:text-zinc-200">
                                        Harga Kas Digital (Rp)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-muted-foreground">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            min="500"
                                            step="500"
                                            value={createForm.data.price}
                                            onChange={e => createForm.setData('price', e.target.value)}
                                            placeholder="1000"
                                            required
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Nominal yang akan dipotong dari saldo dompet kas room user.</p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2.5 rounded-xl border border-border dark:border-zinc-800 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20"
                                    >
                                        {createForm.processing ? 'Menyimpan...' : 'Simpan Paket Baru'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDIT PAKET */}
                {editingPackage && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Paket Perpanjangan Room
                                </h3>
                                <button onClick={() => setEditingPackage(null)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-foreground dark:text-zinc-200">
                                        Durasi Penambahan Waktu (Jam)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="720"
                                            value={editForm.data.hours}
                                            onChange={e => editForm.setData('hours', e.target.value)}
                                            required
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground text-xs">
                                            Jam
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-foreground dark:text-zinc-200">
                                        Harga Kas Digital (Rp)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-muted-foreground">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            min="500"
                                            step="500"
                                            value={editForm.data.price}
                                            onChange={e => editForm.setData('price', e.target.value)}
                                            required
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingPackage(null)}
                                        className="px-4 py-2.5 rounded-xl border border-border dark:border-zinc-800 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
                                    >
                                        {editForm.processing ? 'Memperbarui...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
