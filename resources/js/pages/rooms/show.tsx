import { Head, useForm, usePage, router } from '@inertiajs/react';
import { showConfirmDialog, showErrorAlert, showInfoAlert, showSuccessAlert, showWarningAlert } from '@/lib/swal';
import { 
    Clock, 
    Wallet, 
    Users, 
    Share2, 
    Copy, 
    Check, 
    Send, 
    Crown, 
    User as UserIcon, 
    ArrowLeft,
    MessageSquare,
    Timer,
    Coins,
    UserMinus,
    LogOut,
    Shield,
    Snowflake,
    Lock,
    Globe,
    UserPlus,
    UserCheck,
    XCircle,
    Bell,
    X,
    PlusCircle,
    AlertTriangle,
    CreditCard,
    Sparkles,
    CheckCircle2,
    Ticket,
    Tag,
    ArrowRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Auth } from '@/types/auth';

interface MemberData {
    id: number;
    user_id: number;
    name: string;
    email: string;
    role_in_room: 'owner' | 'bendahara' | 'member';
    joined_at: string;
}

interface MessageData {
    id: number;
    user_id: number;
    user_name: string;
    role_in_room: string;
    message: string;
    time: string;
}

interface AnnouncementData {
    id: number;
    type: string;
    title: string;
    message: string;
    created_at: string;
}

interface PendingJoinRequestData {
    id: number;
    user_id: number;
    name: string;
    email: string;
    created_at: string;
    time_left: string;
}

interface PromoResult {
    valid: boolean;
    code: string;
    type: string;
    value: number;
    discount: number;
    pay_amount: number;
    message: string;
}

interface RoomDetailProps {
    room: {
        id: number;
        name: string;
        code: string;
        type?: 'public' | 'private';
        duration_hours: number;
        expires_at: string;
        wallet_balance: number;
        is_frozen?: boolean;
        freeze_reason?: string | null;
        is_owner: boolean;
    };
    members: MemberData[];
    messages: MessageData[];
    announcements?: AnnouncementData[];
    pendingRequests?: PendingJoinRequestData[];
}

export default function RoomShow({ room, members, messages, announcements = [], pendingRequests = [] }: RoomDetailProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth?.user;
    const isOwnerOrAdmin = room.is_owner || currentUser?.role === 'admin';

    // State untuk Copy Link & Share Modal
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // State untuk Dismiss Notification Banners (Persisted in localStorage per user & room)
    const storageKey = currentUser ? `dismissed_announcements_${currentUser.id}_${room.id}` : `dismissed_announcements_${room.id}`;
    const frozenBannerKey = currentUser ? `hide_frozen_banner_${currentUser.id}_${room.id}` : `hide_frozen_banner_${room.id}`;

    const [dismissedIds, setDismissedIds] = useState<number[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [hideFrozenBanner, setHideFrozenBanner] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem(frozenBannerKey) === 'true';
        } catch (e) {
            return false;
        }
    });

    // State Top Up Saldo Kas Modal & Kode Promo
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [selectedNominal, setSelectedNominal] = useState<number>(20000);
    const [customNominalInput, setCustomNominalInput] = useState<string>('20000');
    const [promoInput, setPromoInput] = useState<string>('');
    const [appliedPromo, setAppliedPromo] = useState<PromoResult | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
    const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
    const [simulatorOrderId, setSimulatorOrderId] = useState<string | null>(null);

    // Form Inertia untuk Kirim Pesan Chat
    const chatForm = useForm({
        message: '',
    });

    // Real-Time Countdown Timer calculation
    const calculateSecondsLeft = () => {
        const diff = Math.floor((new Date(room.expires_at).getTime() - new Date().getTime()) / 1000);
        return diff > 0 ? diff : 0;
    };

    const [secondsLeft, setSecondsLeft] = useState(calculateSecondsLeft());

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft(calculateSecondsLeft());
        }, 1000);
        return () => clearInterval(interval);
    }, [room.expires_at]);

    // Load Midtrans Snap JS SDK dynamically
    useEffect(() => {
        const snapUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        if (!document.querySelector(`script[src="${snapUrl}"]`)) {
            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', 'SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY');
            document.body.appendChild(script);
        }
    }, []);

    const formatTime = (totalSec: number) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleCopyCode = () => {
        navigator.clipboard?.writeText(room.code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyDirectLink = () => {
        const link = `${window.location.origin}/rooms/${room.code}`;
        navigator.clipboard?.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const text = `Yuk gabung ke room "${room.name}" di ShareRoom! Kode Unik: *${room.code}*. Klik link: ${window.location.origin}/rooms/${room.code}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatForm.data.message.trim()) return;

        chatForm.post(`/rooms/${room.code}/messages`, {
            preserveScroll: true,
            onSuccess: () => {
                chatForm.reset();
            },
        });
    };

    const handleToggleBendaharaRole = (memberId: number, currentRole: string) => {
        const newRole = currentRole === 'bendahara' ? 'member' : 'bendahara';
        router.post(`/rooms/${room.code}/members/${memberId}/role`, {
            role_in_room: newRole,
        }, {
            preserveScroll: true,
        });
    };

    const handleKickMember = (memberId: number, name: string) => {
        showConfirmDialog({
            title: `Kick ${name}?`,
            text: 'Anggota ini akan dikeluarkan dari room chat.',
            confirmButtonText: 'Ya, Kick Member',
            cancelButtonText: 'Batal',
            icon: 'warning',
        }, () => {
            router.post(`/rooms/${room.code}/members/${memberId}/kick`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleLeaveRoom = () => {
        showConfirmDialog({
            title: 'Keluar dari Room?',
            text: 'Anda akan keluar dari anggota room aktif ini.',
            confirmButtonText: 'Ya, Keluar Room',
            cancelButtonText: 'Batal',
            icon: 'warning',
        }, () => {
            router.post(`/rooms/${room.code}/leave`);
        });
    };

    const handleApproveJoinRequest = (requestId: number, userName: string) => {
        showConfirmDialog({
            title: `Terima ${userName}?`,
            text: 'Pengguna ini akan disetujui untuk masuk dan berinteraksi di room chat private ini.',
            confirmButtonText: 'Ya, Terima',
            cancelButtonText: 'Batal',
            icon: 'question',
        }, () => {
            router.post(`/rooms/${room.code}/requests/${requestId}/approve`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleRejectJoinRequest = (requestId: number, userName: string) => {
        showConfirmDialog({
            title: `Tolak ${userName}?`,
            text: 'Permintaan gabung pengguna ini ke room private akan ditolak.',
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            icon: 'warning',
        }, () => {
            router.post(`/rooms/${room.code}/requests/${requestId}/reject`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleDismissAnnouncement = (id: number) => {
        setDismissedIds((prev) => {
            const updated = prev.includes(id) ? prev : [...prev, id];
            try {
                localStorage.setItem(storageKey, JSON.stringify(updated));
            } catch (e) {
                // ignore
            }
            return updated;
        });
    };

    const handleDismissFrozenBanner = () => {
        setHideFrozenBanner(true);
        try {
            localStorage.setItem(frozenBannerKey, 'true');
        } catch (e) {
            // ignore
        }
    };

    // TOP UP SALDO KAS & KODE PROMO LOGIC
    const handleSelectNominalPreset = (amount: number) => {
        setSelectedNominal(amount);
        setCustomNominalInput(amount.toString());
        // Reset promo if nominal changes to ensure min_topup constraints
        if (appliedPromo) {
            reverifyPromo(promoInput, amount);
        }
    };

    const handleCustomNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value.replace(/\D/g, '');
        setCustomNominalInput(valStr);
        const valNum = parseInt(valStr, 10) || 0;
        setSelectedNominal(valNum);
        if (appliedPromo) {
            reverifyPromo(promoInput, valNum);
        }
    };

    const handleApplyPromo = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!promoInput.trim()) return;

        setIsVerifyingPromo(true);
        setPromoError(null);

        try {
            const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            const csrfToken = tokenEl ? tokenEl.content : '';

            const res = await fetch(`/rooms/${room.code}/topup/verify-promo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    promo_code: promoInput,
                    amount: selectedNominal,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.valid) {
                setAppliedPromo(null);
                setPromoError(data.message || 'Kode promo tidak valid.');
            } else {
                setAppliedPromo(data);
                setPromoError(null);
            }
        } catch (err) {
            setPromoError('Gagal memeriksa kode promo.');
        } finally {
            setIsVerifyingPromo(false);
        }
    };

    const reverifyPromo = async (code: string, amount: number) => {
        if (!code.trim() || amount < 10000) return;
        try {
            const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            const csrfToken = tokenEl ? tokenEl.content : '';

            const res = await fetch(`/rooms/${room.code}/topup/verify-promo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    promo_code: code,
                    amount: amount,
                }),
            });

            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedPromo(data);
                setPromoError(null);
            } else {
                setAppliedPromo(null);
                setPromoError(data.message || 'Kode promo tidak memenuhi syarat minimal top up.');
            }
        } catch (err) {
            // silent fail on reverify
        }
    };

    const handleRemoveAppliedPromo = () => {
        setAppliedPromo(null);
        setPromoInput('');
        setPromoError(null);
    };

    const calculatedDiscount = appliedPromo?.discount || 0;
    const finalPayAmount = Math.max(0, selectedNominal - calculatedDiscount);

    const handleTopUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (room.is_frozen) {
            showWarningAlert('Dompet digital room sedang dibekukan oleh Admin.', 'Aksi Ditolak');
            return;
        }

        if (selectedNominal < 10000) {
            showWarningAlert('Nominal top up minimal Rp 10.000.', 'Jumlah Kurang');
            return;
        }

        setIsProcessingTopUp(true);

        try {
            const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            const csrfToken = tokenEl ? tokenEl.content : '';

            const res = await fetch(`/rooms/${room.code}/topup/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    amount: selectedNominal,
                    promo_code: appliedPromo ? appliedPromo.code : null,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                showErrorAlert(data.error || 'Gagal memproses token pembayaran Midtrans.', 'Gagal Top Up');
                setIsProcessingTopUp(false);
                return;
            }

            const snapToken = data.snap_token;
            const orderId = data.order_id;

            if ((window as any).snap && snapToken && !snapToken.startsWith('SIMULATOR-TOKEN-')) {
                (window as any).snap.pay(snapToken, {
                    onSuccess: function () {
                        confirmFinishPayment(orderId);
                    },
                    onPending: function () {
                        showInfoAlert('Menunggu pembayaran diselesaikan.', 'Status Pending');
                        setIsProcessingTopUp(false);
                    },
                    onError: function () {
                        showErrorAlert('Pembayaran gagal atau dibatalkan.', 'Transaksi Gagal');
                        setIsProcessingTopUp(false);
                    },
                    onClose: function () {
                        setIsProcessingTopUp(false);
                    },
                });
            } else {
                setSimulatorOrderId(orderId);
                setIsProcessingTopUp(false);
            }
        } catch (err: any) {
            showErrorAlert('Terjadi kesalahan jaringan saat menghubungkan ke Midtrans Sandbox.', 'Error Jaringan');
            setIsProcessingTopUp(false);
        }
    };

    const confirmFinishPayment = (orderId: string) => {
        router.post(`/rooms/${room.code}/topup/finish`, { order_id: orderId }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowTopUpModal(false);
                setSimulatorOrderId(null);
                setIsProcessingTopUp(false);
                setAppliedPromo(null);
                setPromoInput('');

                const promoSuccessNote = calculatedDiscount > 0
                    ? ` (Hemat Rp ${calculatedDiscount.toLocaleString('id-ID')} pake promo ${appliedPromo?.code})`
                    : '';

                showSuccessAlert(
                    `Saldo Kas Dompet bertambah Rp ${selectedNominal.toLocaleString('id-ID')}! Total yang dibayar: Rp ${finalPayAmount.toLocaleString('id-ID')}${promoSuccessNote}.`,
                    'Top Up Berhasil'
                );
            },
            onError: () => {
                setIsProcessingTopUp(false);
            },
        });
    };

    return (
        <>
            <Head title={`Room: ${room.name} — ShareRoom`} />

            <div className="min-h-screen bg-background dark:bg-[#0e0f12] text-foreground dark:text-zinc-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                
                {/* Room Top Header Bar */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <a href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                            </a>
                            <span className="text-muted-foreground">•</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> Live Room Active
                            </span>
                            <span className="text-muted-foreground">•</span>
                            {room.type === 'private' ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1" title="Room Private: Akses harus disetujui owner">
                                    <Lock className="w-3 h-3 text-amber-500" /> Private Room
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1" title="Room Public: Akses langsung dengan kode">
                                    <Globe className="w-3 h-3 text-indigo-500" /> Public Room
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
                            <span>{room.name}</span>
                        </h1>
                    </div>

                    {/* Right Action Widgets */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Live Timer Counter */}
                        <div className="bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
                            <Timer className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Sisa Waktu Room</span>
                                <span className="font-mono font-bold text-amber-500 dark:text-amber-400">{formatTime(secondsLeft)}</span>
                            </div>
                        </div>

                        {/* Kas Dompet Digital Room Widget */}
                        <div className={`border px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 ${
                            room.is_frozen 
                                ? 'bg-rose-500/10 border-rose-500/30' 
                                : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800'
                        }`}>
                            <Wallet className={`w-4 h-4 ${room.is_frozen ? 'text-rose-500' : 'text-emerald-500 dark:text-emerald-400'}`} />
                            <div>
                                <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Saldo Dompet Kas</span>
                                    {room.is_frozen && (
                                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/20 px-1 rounded">
                                            (Dibekukan)
                                        </span>
                                    )}
                                </div>
                                <span className={`font-mono font-bold ${room.is_frozen ? 'text-rose-600 dark:text-rose-400 line-through opacity-80' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    Rp {room.wallet_balance.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Tombol Top Up Kas (Midtrans) */}
                        <button
                            onClick={() => setShowTopUpModal(true)}
                            className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                            title="Top Up Saldo Kas Dompet via Midtrans"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>Top Up Kas</span>
                        </button>

                        {/* Tombol Bagikan Kode Unik */}
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Bagikan Kode</span>
                        </button>

                        {/* Tombol Keluar Room bagi Member */}
                        {!room.is_owner && (
                            <button
                                onClick={handleLeaveRoom}
                                className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                                title="Keluar dari room ini"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Keluar Room</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* NOTIFICATION BANNERS SECTION */}
                <div className="space-y-3">
                    {/* Owner Pending Join Requests Banner */}
                    {isOwnerOrAdmin && pendingRequests.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-sm animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                                        Permintaan Gabung Room Private ({pendingRequests.length})
                                    </h4>
                                </div>
                                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                    Persetujuan Owner Room
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {pendingRequests.map((req) => (
                                    <div key={req.id} className="bg-background dark:bg-zinc-950 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
                                        <div className="space-y-0.5 min-w-0">
                                            <p className="font-bold text-foreground dark:text-white truncate flex items-center gap-1.5">
                                                <span>{req.name}</span>
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate">{req.email}</p>
                                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                                                Minta: {req.created_at} ({req.time_left})
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                onClick={() => handleApproveJoinRequest(req.id, req.name)}
                                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                                                title="Setujui bergabung"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" />
                                                <span>Terima</span>
                                            </button>
                                            <button
                                                onClick={() => handleRejectJoinRequest(req.id, req.name)}
                                                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1"
                                                title="Tolak permintaan"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                <span>Tolak</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* 1. Frozen Wallet Alert Banner with Admin Reason */}
                    {room.is_frozen && !hideFrozenBanner && (
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start justify-between gap-4 text-xs shadow-sm animate-in fade-in duration-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 mt-0.5">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm flex items-center gap-1.5">
                                        <span>Dompet Digital Room Dibekukan oleh Admin</span>
                                    </h4>
                                    <p className="text-rose-600 dark:text-rose-300 font-medium">
                                        Alasan Pembekuan: <span className="italic">"{room.freeze_reason || 'Pemeriksaan keamanan oleh administrator server'}"</span>
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        * Saldo tetap aman di dalam sistem namun transaksi kas saat ini tidak dapat digunakan sampai admin mengaktifkan kembali.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDismissFrozenBanner}
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors flex-shrink-0"
                                title="Tutup notifikasi ini"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* 2. Admin Announcements Banners */}
                    {announcements
                        .filter(a => !dismissedIds.includes(a.id))
                        .map(ann => {
                            const isAddFunds = ann.type === 'add_funds';
                            const isUnfreeze = ann.type === 'unfreeze';

                            return (
                                <div
                                    key={ann.id}
                                    className={`border rounded-2xl p-4 flex items-start justify-between gap-4 text-xs shadow-sm transition-all animate-in fade-in duration-200 ${
                                        isAddFunds
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                            : isUnfreeze
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-xl mt-0.5 ${
                                            isAddFunds
                                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                : isUnfreeze
                                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                        }`}>
                                            {isAddFunds ? <PlusCircle className="w-5 h-5" /> : isUnfreeze ? <Coins className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm">{ann.title}</h4>
                                                <span className="text-[10px] opacity-75 font-mono">• {ann.created_at}</span>
                                            </div>
                                            <p className="leading-relaxed opacity-95">{ann.message}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDismissAnnouncement(ann.id)}
                                        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                                        title="Tutup notifikasi ini"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                </div>

                {/* MODAL: REDESIGNED TOP UP SALDO KAS + KODE PROMO (MIDTRANS SANDBOX) */}
                {showTopUpModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <div>
                                    <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-emerald-500" /> Top Up Saldo Kas Dompet
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">Pilih nominal dan nikmati promo diskon khusus!</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowTopUpModal(false);
                                        setSimulatorOrderId(null);
                                    }}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Warning if Wallet Frozen */}
                            {room.is_frozen && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 font-semibold">
                                    <Lock className="w-4 h-4" /> Dompet Digital sedang dibekukan oleh Admin.
                                </div>
                            )}

                            {/* Local Simulator Modal Mode */}
                            {simulatorOrderId ? (
                                <div className="bg-background dark:bg-zinc-950 border border-indigo-500/30 p-5 rounded-2xl space-y-4 text-center">
                                    <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                        <Sparkles className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-foreground dark:text-white text-sm">Simulasi Midtrans Payment Sandbox</h4>
                                        <p className="text-xs text-muted-foreground">Order ID: <span className="font-mono text-indigo-500 font-semibold">{simulatorOrderId}</span></p>
                                        
                                        <div className="py-2 space-y-1">
                                            <p className="text-xs text-muted-foreground">Total Pembayaran Diskon:</p>
                                            <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                Rp {finalPayAmount.toLocaleString('id-ID')}
                                            </p>
                                            {calculatedDiscount > 0 && (
                                                <span className="text-[11px] text-emerald-500 font-semibold block">
                                                    (Hemat Rp {calculatedDiscount.toLocaleString('id-ID')} pake promo {appliedPromo?.code})
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2 flex flex-col gap-2">
                                        <button
                                            onClick={() => confirmFinishPayment(simulatorOrderId)}
                                            disabled={isProcessingTopUp}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Simulasi Bayar Berhasil (Sandbox)</span>
                                        </button>
                                        <button
                                            onClick={() => setSimulatorOrderId(null)}
                                            className="w-full py-2 bg-transparent text-xs text-muted-foreground hover:text-foreground font-semibold"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleTopUpSubmit} className="space-y-4">
                                    {/* Preset Nominal Visual Chips */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground dark:text-zinc-300 flex items-center justify-between">
                                            <span>Pilih Nominal Top Up (Saldo Kas Diterima)</span>
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Paling Populer</span>
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {[10000, 20000, 50000, 100000].map((amt) => {
                                                const isSelected = selectedNominal === amt;
                                                return (
                                                    <button
                                                        key={amt}
                                                        type="button"
                                                        onClick={() => handleSelectNominalPreset(amt)}
                                                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                                                            isSelected
                                                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/50 scale-[1.02]'
                                                                : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 text-foreground dark:text-zinc-300 hover:border-emerald-500/50'
                                                        }`}
                                                    >
                                                        <span className={`text-[10px] uppercase font-bold block ${isSelected ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                                                            Saldo
                                                        </span>
                                                        <span className="text-sm font-mono font-bold pt-1">
                                                            Rp {(amt / 1000).toFixed(0)}k
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Manual Nominal Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                            Atau Input Nominal Bebas (Rp)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-muted-foreground">
                                                Rp
                                            </span>
                                            <input
                                                type="text"
                                                value={customNominalInput}
                                                onChange={handleCustomNominalChange}
                                                placeholder="10000"
                                                required
                                                className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block">
                                            * Nominal minimal Rp 10.000.
                                        </span>
                                    </div>

                                    {/* SECTION KODE PROMO OPSIONAL */}
                                    <div className="pt-2 border-t border-border dark:border-zinc-800 space-y-2">
                                        <label className="text-xs font-semibold text-foreground dark:text-zinc-300 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Ticket className="w-3.5 h-3.5 text-indigo-500" /> Punya Kode Promo? <span className="text-[10px] text-muted-foreground font-normal">(Opsional)</span>
                                            </span>
                                            <span className="text-[10px] text-indigo-500 font-semibold">Coba: HEMAT50 / DISKON5K</span>
                                        </label>

                                        {appliedPromo ? (
                                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    <div>
                                                        <span className="font-bold font-mono uppercase">{appliedPromo.code}</span>
                                                        <span className="text-[11px] block text-emerald-600 dark:text-emerald-400 font-medium">
                                                            {appliedPromo.message} (Hemat Rp {appliedPromo.discount.toLocaleString('id-ID')})
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveAppliedPromo}
                                                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold underline"
                                                >
                                                    Hapus Promo
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text"
                                                        value={promoInput}
                                                        onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                                        placeholder="Ketik Kode Promo (misal: HEMAT50)"
                                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-3.5 pr-3 py-2 text-xs text-foreground dark:text-white font-mono uppercase font-semibold focus:outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleApplyPromo}
                                                    disabled={isVerifyingPromo || !promoInput.trim()}
                                                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                                                >
                                                    {isVerifyingPromo ? 'Memeriksa...' : 'Terapkan'}
                                                </button>
                                            </div>
                                        )}

                                        {promoError && (
                                            <p className="text-rose-500 text-[11px] font-medium flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {promoError}
                                            </p>
                                        )}
                                    </div>

                                    {/* VISUAL PAYMENT BREAKDOWN SUMMARY CARD */}
                                    <div className="bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>Nominal Top Up Kas Diterima</span>
                                            <span className="font-mono font-bold text-foreground dark:text-white">
                                                Rp {selectedNominal.toLocaleString('id-ID')}
                                            </span>
                                        </div>

                                        {calculatedDiscount > 0 && (
                                            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                                                <span className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3" /> Diskon Kode Promo ({appliedPromo?.code})
                                                </span>
                                                <span className="font-mono font-bold">
                                                    - Rp {calculatedDiscount.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-border dark:border-zinc-800 flex items-center justify-between font-bold">
                                            <span className="text-foreground dark:text-white">Total Bayar via Midtrans</span>
                                            <span className="text-base font-mono text-emerald-600 dark:text-emerald-400">
                                                Rp {finalPayAmount.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowTopUpModal(false)}
                                            className="px-4 py-2.5 rounded-xl border border-border dark:border-zinc-800 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isProcessingTopUp || room.is_frozen || selectedNominal < 10000}
                                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            <span>{isProcessingTopUp ? 'Memproses Token...' : 'Lanjutkan Midtrans Sandbox'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Share Modal Dialog */}
                {showShareModal && (
                    <div className="bg-card dark:bg-zinc-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                            <h3 className="font-bold text-foreground dark:text-white text-sm flex items-center gap-2">
                                <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Bagikan Kode Unik Room
                            </h3>
                            <button onClick={() => setShowShareModal(false)} className="text-xs text-muted-foreground hover:text-foreground">
                                Batal
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Option 1: Copy Code */}
                            <button
                                onClick={handleCopyCode}
                                className="p-3 bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl text-left space-y-1 transition-colors"
                            >
                                <span className="text-xs text-muted-foreground font-semibold block">Kode Unik:</span>
                                <span className="text-lg font-mono font-bold text-amber-500 dark:text-amber-400 flex items-center justify-between">
                                    {room.code}
                                    {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                                </span>
                            </button>

                            {/* Option 2: WhatsApp Share */}
                            <button
                                onClick={handleShareWhatsApp}
                                className="p-3 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl text-left space-y-1 transition-colors"
                            >
                                <span className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold block">Bagikan via WhatsApp</span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block pt-1">Kirim Pesan WA</span>
                            </button>

                            {/* Option 3: Copy Direct Link */}
                            <button
                                onClick={handleCopyDirectLink}
                                className="p-3 bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl text-left space-y-1 transition-colors"
                            >
                                <span className="text-xs text-muted-foreground font-semibold block">Link Langsung:</span>
                                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-300 flex items-center justify-between pt-1">
                                    {copiedLink ? 'Link Tersalin!' : 'Salin URL Direct'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Grid: Left Chat Feed & Right Members Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: LIVE GROUP CHAT FEED */}
                    <div className="lg:col-span-8 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between min-h-[540px] shadow-sm">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h2 className="font-bold text-foreground dark:text-white text-sm">Obrolan Room ({messages.length})</h2>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono">End-to-End Temporary Chat</span>
                        </div>

                        {/* Chat Messages Feed Container */}
                        <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 my-auto py-2">
                            {messages.map((msg) => {
                                const isSelf = msg.user_id === currentUser?.id;
                                const isOwner = msg.role_in_room === 'owner';
                                const isBendahara = msg.role_in_room === 'bendahara';

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start gap-2.5 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        {/* User Initial Avatar */}
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 text-white shadow-sm ${
                                                isSelf
                                                    ? 'bg-indigo-600'
                                                    : isOwner
                                                    ? 'bg-amber-600'
                                                    : isBendahara
                                                    ? 'bg-emerald-600'
                                                    : 'bg-zinc-600 dark:bg-zinc-700'
                                            }`}
                                        >
                                            {msg.user_name.charAt(0)}
                                        </div>

                                        {/* Gelembung Chat Bubble */}
                                        <div
                                            className={`max-w-[78%] rounded-2xl p-3.5 text-xs border space-y-1 shadow-sm ${
                                                isSelf
                                                    ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500'
                                                    : 'bg-background dark:bg-zinc-950 text-foreground dark:text-zinc-200 rounded-tl-none border-border dark:border-zinc-800'
                                            }`}
                                        >
                                            {/* Sender Header Name & Role Badge */}
                                            <div className="flex items-center gap-2 justify-between border-b border-white/10 dark:border-white/10 pb-1 mb-1">
                                                <span className="font-bold text-[11px] flex items-center gap-1.5 flex-wrap">
                                                    <span>{msg.user_name}</span>
                                                    {isOwner && (
                                                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[9px] font-bold border border-amber-500/30 inline-flex items-center gap-0.5">
                                                            <Crown className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" /> Owner Room
                                                        </span>
                                                    )}
                                                    {isBendahara && (
                                                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[9px] font-bold border border-emerald-500/30 inline-flex items-center gap-0.5">
                                                            <Coins className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" /> Bendahara
                                                        </span>
                                                    )}
                                                </span>
                                                <span className={`text-[9px] font-mono ${isSelf ? 'text-indigo-200' : 'text-muted-foreground'}`}>{msg.time}</span>
                                            </div>

                                            {/* Message Text */}
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {messages.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground space-y-2">
                                    <MessageSquare className="w-8 h-8 mx-auto opacity-50" />
                                    <p className="text-xs">Belum ada pesan di room ini. Mulai percakapan pertama!</p>
                                </div>
                            )}
                        </div>

                        {/* Send Message Form Bar */}
                        <form onSubmit={handleSendMessage} className="pt-3 border-t border-border dark:border-zinc-800 flex gap-2">
                            <input
                                type="text"
                                value={chatForm.data.message}
                                onChange={e => chatForm.setData('message', e.target.value)}
                                placeholder="Ketik pesan kamu..."
                                required
                                className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={chatForm.processing}
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                            >
                                <Send className="w-4 h-4" />
                                <span>Kirim</span>
                            </button>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: DAFTAR ANGGOTA / MEMBER ROOM & BENDAHARA MANAGEMENT & KICK */}
                    <div className="lg:col-span-4 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-bold text-foreground dark:text-white text-sm">Anggota Room ({members.length})</h3>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Role</span>
                        </div>

                        {/* Members List */}
                        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                            {members.map((m) => {
                                const isOwner = m.role_in_room === 'owner';
                                const isBendahara = m.role_in_room === 'bendahara';

                                return (
                                    <div key={m.id} className="bg-background dark:bg-zinc-950 p-3 rounded-xl border border-border dark:border-zinc-800 space-y-2.5 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                                                    isOwner ? 'bg-amber-600' : isBendahara ? 'bg-emerald-600' : 'bg-indigo-600'
                                                }`}>
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground dark:text-white text-xs flex items-center gap-1">
                                                        <span>{m.name}</span>
                                                        {m.user_id === currentUser?.id && (
                                                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">(Saya)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">{m.joined_at}</p>
                                                </div>
                                            </div>

                                            {/* Role Badge */}
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                                                isOwner 
                                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
                                                    : isBendahara
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground'
                                            }`}>
                                                {isOwner ? (
                                                    <>
                                                        <Crown className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Owner
                                                    </>
                                                ) : isBendahara ? (
                                                    <>
                                                        <Coins className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Bendahara
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserIcon className="w-3 h-3 text-muted-foreground" /> Member
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        {/* Actions for Owner / Admin: Assign Bendahara or Kick Member */}
                                        {isOwnerOrAdmin && !isOwner && m.user_id !== currentUser?.id && (
                                            <div className="pt-2 border-t border-border dark:border-zinc-900 flex items-center justify-end gap-2">
                                                {/* Toggle Bendahara */}
                                                <button
                                                    onClick={() => handleToggleBendaharaRole(m.id, m.role_in_room)}
                                                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                                                        isBendahara
                                                            ? 'bg-zinc-200 dark:bg-zinc-800 text-foreground dark:text-zinc-300 hover:bg-zinc-300'
                                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                                    }`}
                                                >
                                                    <Coins className="w-3 h-3" />
                                                    <span>{isBendahara ? 'Batal Bendahara' : 'Set Bendahara'}</span>
                                                </button>

                                                {/* Kick Member */}
                                                <button
                                                    onClick={() => handleKickMember(m.id, m.name)}
                                                    className="px-2 py-1 rounded text-[10px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-1"
                                                    title="Keluarkan anggota dari room"
                                                >
                                                    <UserMinus className="w-3 h-3" />
                                                    <span>Kick</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

RoomShow.layout = {
    breadcrumbs: [
        {
            title: 'Room Chat',
            href: '#',
        },
    ],
};
