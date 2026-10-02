import { Head, router, useForm, usePoll } from '@inertiajs/react';
import { showConfirmDialog, showWarningAlert } from '@/lib/swal';
import { 
    DoorClosed, 
    Trash2, 
    User as UserIcon,
    Users,
    PlusCircle,
    Snowflake,
    Flame,
    Lock,
    AlertCircle,
    X,
    Wallet,
    Crown,
    Clock,
    TrendingUp,
    Coins,
    Clock3,
    ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

interface RoomData {
    id: number;
    name: string;
    code: string;
    duration_hours: number;
    expires_at: string;
    wallet_balance: number;
    is_frozen: boolean;
    freeze_reason?: string | null;
    is_expired?: boolean;
    is_premium?: boolean;
    members_count?: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface WalletStats {
    active_wallet_balance: number;
    expired_wallet_balance: number;
    total_combined_balance: number;
}

interface AdminRoomsIndexProps {
    rooms: RoomData[];
    walletStats?: WalletStats;
}

export default function AdminRoomsIndex({ rooms, walletStats }: AdminRoomsIndexProps) {
    // Real-Time Sync for Admin Rooms & Wallet Stats
    usePoll(3000, {
        only: ['rooms', 'walletStats']
    }, {
        keepAlive: true
    });
    // State Modal Tambah Saldo
    const [selectedAddFundsRoom, setSelectedAddFundsRoom] = useState<RoomData | null>(null);
    const addFundsForm = useForm({
        amount: '',
    });

    // State Modal Bekukan Dompet
    const [selectedFreezeRoom, setSelectedFreezeRoom] = useState<RoomData | null>(null);
    const freezeForm = useForm({
        reason: '',
    });

    const handleDeleteRoom = (roomId: number) => {
        showConfirmDialog({
            title: 'Hapus Room?',
            text: 'Seluruh data room, riwayat obrolan, dan dompet kas akan terhapus.',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'error',
        }, () => {
            router.delete(`/admin/rooms/${roomId}`);
        });
    };

    const handleAddFundsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAddFundsRoom) return;

        addFundsForm.post(`/admin/rooms/${selectedAddFundsRoom.id}/add-funds`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedAddFundsRoom(null);
                addFundsForm.reset();
            },
        });
    };

    const handleFreezeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFreezeRoom) return;
        if (!freezeForm.data.reason.trim()) {
            showWarningAlert('Alasan pembekuan dompet wajib diisi!', 'Form Belum Lengkap');
            return;
        }

        freezeForm.post(`/admin/rooms/${selectedFreezeRoom.id}/freeze`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedFreezeRoom(null);
                freezeForm.reset();
            },
        });
    };

    const handleUnfreeze = (roomId: number) => {
        showConfirmDialog({
            title: 'Aktifkan Kembali Dompet?',
            text: 'Dompet digital room ini akan diaktifkan kembali dan dapat digunakan.',
            confirmButtonText: 'Ya, Aktifkan',
            cancelButtonText: 'Batal',
            icon: 'info',
        }, () => {
            router.post(`/admin/rooms/${roomId}/unfreeze`, {}, {
                preserveScroll: true,
            });
        });
    };

    return (
        <>
            <Head title="Manajemen Room — ShareRoom Admin" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background dark:bg-[#0e0f12] text-foreground dark:text-zinc-100 min-h-screen">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                            <DoorClosed className="w-3.5 h-3.5" /> Fitur Admin Terpisah
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
                            Manajemen Room ({rooms?.length || 0})
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400">
                            Kelola saldo kas dompet room secara manual, pelacakan saldo dana terbuang, bekukan dompet bermasalah, atau hapus room.
                        </p>
                    </div>
                </div>

                {/* 3 FINANSL WALLET CARDS REAL-TIME STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* DOMPET 1: SALDO DIGITAL ROOM AKTIF */}
                    <div className="bg-card dark:bg-zinc-900 border border-emerald-500/30 p-5 rounded-2xl space-y-2 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <Wallet className="w-4 h-4 text-emerald-500" /> 1. Saldo Digital Room Aktif
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold">Live</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block">
                                Rp {(walletStats?.active_wallet_balance || 0).toLocaleString('id-ID')}
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                                Dana digital tersimpan pada seluruh room user yang sedang berjalan (aktif).
                            </p>
                        </div>
                    </div>

                    {/* DOMPET 2: SALDO DANA TERBUANG / EXPIRED ROOMS */}
                    <div className="bg-card dark:bg-zinc-900 border border-amber-500/30 p-5 rounded-2xl space-y-2 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                <Clock3 className="w-4 h-4 text-amber-500" /> 2. Saldo Terbuang (Expired)
                            </span>
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold">Hangus</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-2xl font-mono font-extrabold text-amber-500 block">
                                Rp {(walletStats?.expired_wallet_balance || 0).toLocaleString('id-ID')}
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                                Saldo tersisa di room user yang terlanjur kadaluarsa / telah ditutup.
                            </p>
                        </div>
                    </div>

                    {/* DOMPET 3: TOTAL SALDO GABUNGAN ADMIN */}
                    <div className="bg-card dark:bg-zinc-900 border border-indigo-500/30 p-5 rounded-2xl space-y-2 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                <Coins className="w-4 h-4 text-indigo-500" /> 3. Total Saldo Gabungan Admin
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold">Total Kas</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-2xl font-mono font-extrabold text-indigo-500 block">
                                Rp {(walletStats?.total_combined_balance || 0).toLocaleString('id-ID')}
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                                Akumulasi total saldo digital milik Admin (Dompet 1 + Dompet 2).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table & Mobile Card Room List */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                    {/* MOBILE CARD VIEW (Visible on small screens) */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {rooms?.map((r) => (
                            <div key={r.id} className="bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800/80 rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-foreground dark:text-white text-base">{r.name}</span>
                                            {r.is_premium && (
                                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[9px] border border-amber-500/30 inline-flex items-center gap-0.5">
                                                    <Crown className="w-2.5 h-2.5" /> PRO
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold tracking-wider text-xs">
                                            Kode: {r.code}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="shrink-0 text-right">
                                        {r.is_frozen ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" title={`Alasan: ${r.freeze_reason}`}>
                                                <Lock className="w-3 h-3" /> Dibekukan
                                            </span>
                                        ) : r.is_expired ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                <Clock3 className="w-3 h-3 text-amber-500" /> Kadaluarsa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Aktif Normal
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Room Details */}
                                <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-border/50 dark:border-zinc-800/50">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Pembuat Room</span>
                                        <span className="text-foreground dark:text-zinc-200 font-medium truncate block">
                                            {r.user ? r.user.name : 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Saldo Kas Room</span>
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            Rp {(r.wallet_balance || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                                        <Users className="w-3 h-3" />
                                        <span>{r.members_count || 0} Member</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setSelectedAddFundsRoom(r)}
                                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                                            title="Tambah saldo kas dompet"
                                        >
                                            <PlusCircle className="w-3 h-3" /> + Saldo
                                        </button>

                                        {r.is_frozen ? (
                                            <button
                                                onClick={() => handleUnfreeze(r.id)}
                                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                                                title="Aktifkan dompet"
                                            >
                                                <Flame className="w-3 h-3" /> Aktifkan
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedFreezeRoom(r)}
                                                className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                                                title="Bekukan dompet"
                                            >
                                                <Snowflake className="w-3 h-3" /> Bekukan
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDeleteRoom(r.id)}
                                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg text-[11px] font-medium transition-colors"
                                            title="Hapus room"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!rooms || rooms.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground text-xs">
                                Belum ada room yang dibuat oleh user.
                            </div>
                        )}
                    </div>

                    {/* DESKTOP TABLE VIEW (Visible on medium+ screens) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="text-muted-foreground bg-background dark:bg-zinc-950 border-b border-border dark:border-zinc-800 font-medium uppercase tracking-wider">
                                <tr>
                                    <th className="p-3.5">Nama Room</th>
                                    <th className="p-3.5">Kode Unik</th>
                                    <th className="p-3.5">Pembuat (User)</th>
                                    <th className="p-3.5">Total User Room</th>
                                    <th className="p-3.5">Kas Dompet</th>
                                    <th className="p-3.5 text-right">Aksi Manajemen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-zinc-800/60">
                                {rooms?.map((r) => (
                                    <tr key={r.id} className="hover:bg-background/50 dark:hover:bg-zinc-950/50 transition-colors">
                                        <td className="p-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground dark:text-white text-sm">{r.name}</span>
                                                {r.is_premium && (
                                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[9px] border border-amber-500/30 flex items-center gap-0.5">
                                                        <Crown className="w-2.5 h-2.5" /> PRO
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold tracking-wider">{r.code}</td>
                                        <td className="p-3.5 text-muted-foreground dark:text-zinc-300">
                                            {r.user ? (
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span>{r.user.name} ({r.user.email})</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">User Tidak Ditemukan</span>
                                            )}
                                        </td>
                                        
                                        {/* Total User Room */}
                                        <td className="p-3.5 text-muted-foreground dark:text-zinc-300">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{r.members_count || 0} Member</span>
                                            </div>
                                        </td>

                                        {/* Kas Dompet Digital & Accurate Status Badge */}
                                        <td className="p-3.5">
                                            <div className="space-y-1">
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
                                                    Rp {(r.wallet_balance || 0).toLocaleString('id-ID')}
                                                </span>
                                                {r.is_frozen ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" title={`Alasan: ${r.freeze_reason}`}>
                                                        <Lock className="w-3 h-3" /> Dibekukan
                                                    </span>
                                                ) : r.is_expired ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        <Clock3 className="w-3 h-3 text-amber-500" /> Kadaluarsa
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Aktif Normal
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Tambah Saldo Button */}
                                                <button
                                                    onClick={() => setSelectedAddFundsRoom(r)}
                                                    className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg font-semibold transition-colors inline-flex items-center gap-1"
                                                    title="Tambah saldo kas dompet secara manual"
                                                >
                                                    <PlusCircle className="w-3.5 h-3.5" /> Tambah Saldo
                                                </button>

                                                {/* Freeze / Unfreeze Button */}
                                                {r.is_frozen ? (
                                                    <button
                                                        onClick={() => handleUnfreeze(r.id)}
                                                        className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg font-semibold transition-colors inline-flex items-center gap-1"
                                                        title="Aktifkan kembali dompet digital"
                                                    >
                                                        <Flame className="w-3.5 h-3.5 text-amber-500" /> Aktifkan
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setSelectedFreezeRoom(r)}
                                                        className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-lg font-semibold transition-colors inline-flex items-center gap-1"
                                                        title="Bekukan dompet digital"
                                                    >
                                                        <Snowflake className="w-3.5 h-3.5 text-sky-500" /> Bekukan
                                                    </button>
                                                )}

                                                {/* Hapus Room Button */}
                                                <button
                                                    onClick={() => handleDeleteRoom(r.id)}
                                                    className="px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-medium transition-colors inline-flex items-center gap-1"
                                                    title="Hapus room"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!rooms || rooms.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            Belum ada room yang dibuat oleh user saat ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL 1: TAMBAH SALDO KAS MANUAL BY ADMIN */}
            {selectedAddFundsRoom && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                            <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-emerald-500" /> Tambah Saldo Kas Dompet
                            </h3>
                            <button
                                onClick={() => setSelectedAddFundsRoom(null)}
                                className="text-muted-foreground hover:text-foreground p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>Room: <strong className="text-foreground dark:text-white">{selectedAddFundsRoom.name}</strong> ({selectedAddFundsRoom.code})</p>
                            <p>Saldo Saat Ini: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">Rp {(selectedAddFundsRoom.wallet_balance || 0).toLocaleString('id-ID')}</strong></p>
                        </div>

                        <form onSubmit={handleAddFundsSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                    Jumlah Nominal Tambahan (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Misal: 50000"
                                    value={addFundsForm.data.amount}
                                    onChange={e => addFundsForm.setData('amount', e.target.value)}
                                    required
                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                                />
                                <span className="text-[10px] text-muted-foreground block">
                                    * Admin hanya dapat menambah saldo kas dompet, tidak dapat mengurangi saldo yang ada.
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAddFundsRoom(null)}
                                    className="px-4 py-2 rounded-xl border border-border dark:border-zinc-800 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addFundsForm.processing}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
                                >
                                    Tambah Saldo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: BEKUKAN DOMPET DIGITAL (DENGAN ALASAN WAJIB) */}
            {selectedFreezeRoom && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                            <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                <Snowflake className="w-5 h-5 text-sky-500" /> Bekukan Dompet Digital Room
                            </h3>
                            <button
                                onClick={() => setSelectedFreezeRoom(null)}
                                className="text-muted-foreground hover:text-foreground p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl flex items-start gap-2.5 text-xs text-sky-600 dark:text-sky-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-sky-500" />
                            <div>
                                Membekukan dompet tidak mengurangi saldo yang ada, namun akan membatasi transaksi dan mengirimkan notifikasi alasan pembekuan ke seluruh anggota room.
                            </div>
                        </div>

                        <form onSubmit={handleFreezeSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                    Alasan Pembekuan <span className="text-rose-500">* (Wajib diisi)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Contoh: Terindikasi transaksi mencurigakan / Pemeriksaan rutin server..."
                                    value={freezeForm.data.reason}
                                    onChange={e => freezeForm.setData('reason', e.target.value)}
                                    required
                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white focus:outline-none focus:border-sky-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedFreezeRoom(null)}
                                    className="px-4 py-2 rounded-xl border border-border dark:border-zinc-800 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={freezeForm.processing}
                                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-md shadow-sky-600/20"
                                >
                                    Konfirmasi Bekukan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

AdminRoomsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Manajemen Room',
            href: '/admin/rooms',
        },
    ],
};
