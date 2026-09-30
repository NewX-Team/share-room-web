import { Head, useForm, usePage, router } from '@inertiajs/react';
import { showConfirmDialog, showWarningAlert } from '@/lib/swal';
import { dashboard } from '@/routes';
import { 
    Users, 
    ShieldAlert, 
    Clock, 
    Wallet, 
    Sparkles, 
    BarChart3, 
    LineChart,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    TrendingDown,
    Activity,
    PieChart,
    Layers,
    CheckCircle2,
    PlusCircle,
    KeyRound,
    LogIn,
    Copy,
    Check,
    ArrowRight,
    Crown,
    Coins,
    User as UserIcon,
    Trash2,
    Lock,
    Globe,
    XCircle,
    X
} from 'lucide-react';
import { useState } from 'react';
import type { Auth } from '@/types/auth';

interface RoomData {
    id: number;
    name: string;
    code: string;
    type?: 'public' | 'private';
    duration_hours: number;
    expires_at: string;
    wallet_balance: number;
    role_in_room?: string;
    is_owner?: boolean;
    is_joined?: boolean;
    is_expired?: boolean;
}

interface PendingRequestData {
    id: number;
    room_id: number;
    room_name: string;
    room_code: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    time_left: string;
}

interface StatsData {
    totalUsers: number;
    totalRooms: number;
    totalActiveRooms: number;
    totalWalletBalance: number;
}

interface DashboardProps {
    stats: StatsData;
    rooms?: RoomData[];
    pendingJoinRequests?: PendingRequestData[];
}

export default function Dashboard({ stats, rooms = [], pendingJoinRequests = [] }: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth?.user;
    const isAdmin = currentUser?.role === 'admin';

    // Inertia Forms for User
    const createRoomForm = useForm({
        name: '',
        type: 'public' as 'public' | 'private',
        duration_hours: 3,
    });

    const joinRoomForm = useForm({
        code: '',
    });

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        createRoomForm.post('/rooms');
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        joinRoomForm.post('/rooms/join');
    };

    const handleCopyCode = (code: string, idx: number) => {
        navigator.clipboard?.writeText(code);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleRemoveHistory = (roomId: number, isJoined: boolean, isExpired: boolean) => {
        if (isJoined && !isExpired) {
            showWarningAlert('Anda masih terdaftar di room aktif ini! Silakan masuk dan pilih "Keluar dari Room" terlebih dahulu sebelum menghapus riwayat.', 'Aksi Ditolak');
            return;
        }

        showConfirmDialog({
            title: 'Hapus Riwayat Room?',
            text: 'Riwayat room ini akan dihapus dari dashboard Anda.',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            icon: 'warning',
        }, () => {
            router.delete(`/rooms/${roomId}/history`);
        });
    };

    const handleDismissRequest = (requestId: number) => {
        router.delete(`/rooms/requests/${requestId}/dismiss`, {
            preserveScroll: true,
        });
    };

    // Trend data for admin charts
    const userGrowthData = [
        { month: 'Jan', count: 12 },
        { month: 'Feb', count: 19 },
        { month: 'Mar', count: 28 },
        { month: 'Apr', count: 35 },
        { month: 'Mei', count: 52 },
        { month: 'Jun', count: stats?.totalUsers || 65 },
    ];

    // Market Candlestick Pattern Data (Hijau/Bullish Inflow vs Merah/Bearish Adjustment)
    const financialCandlestickData = [
        { day: 'Senin', open: 120000, high: 210000, low: 100000, close: 190000, volume: 450000, isBullish: true, change: '+58.3%' },
        { day: 'Selasa', open: 190000, high: 205000, low: 140000, close: 155000, volume: 320000, isBullish: false, change: '-18.4%' },
        { day: 'Rabu', open: 155000, high: 280000, low: 150000, close: 260000, volume: 680000, isBullish: true, change: '+67.7%' },
        { day: 'Kamis', open: 260000, high: 290000, low: 210000, close: 230000, volume: 490000, isBullish: false, change: '-11.5%' },
        { day: 'Jumat', open: 230000, high: 360000, low: 220000, close: 345000, volume: 810000, isBullish: true, change: '+50.0%' },
        { day: 'Sabtu', open: 345000, high: 430000, low: 330000, close: 410000, volume: 960000, isBullish: true, change: '+18.8%' },
        { day: 'Minggu', open: 410000, high: 420000, low: 330000, close: 350000, volume: 590000, isBullish: false, change: '-14.6%' },
    ];

    const walletGrowthData = [
        { week: 'Minggu 1', balance: 250000 },
        { week: 'Minggu 2', balance: 520000 },
        { week: 'Minggu 3', balance: 890000 },
        { week: 'Minggu 4', balance: stats?.totalWalletBalance || 1450000 },
    ];

    return (
        <>
            <Head title={isAdmin ? 'Dashboard Utama Admin — ShareRoom' : 'Dashboard Saya — ShareRoom'} />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {isAdmin ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5" /> Dashboard Utama Admin
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" /> User Workspace
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
                            Halo, {currentUser?.name || 'User'}!
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400">
                            {isAdmin 
                                ? 'Pantau total pengguna, total room terdaftar, dan grafik pertumbuhan kas secara real-time.'
                                : 'Buat room temporary (Public / Private) baru atau masuk menggunakan kode unik.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 px-4 py-2 rounded-xl text-xs">
                            <span className="text-muted-foreground block">Role Akun</span>
                            <span className={`font-bold font-mono uppercase ${isAdmin ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                {currentUser?.role || 'user'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 📊 DASHBOARD UNTUK ADMINISTRATOR                                          */}
                {/* ========================================================================= */}
                {isAdmin ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Main Stats Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Stat 1: Total Users */}
                            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition-colors shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-zinc-400">
                                    <span className="font-semibold uppercase tracking-wider">Total User Terdaftar</span>
                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                        <Users className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-foreground dark:text-white font-mono">{stats?.totalUsers ?? 0}</span>
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                                        <ArrowUpRight className="w-3.5 h-3.5" /> +12% bulan ini
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground dark:text-zinc-500">Pengguna aktif terverifikasi di server</p>
                            </div>

                            {/* Stat 2: Total Rooms */}
                            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-colors shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-zinc-400">
                                    <span className="font-semibold uppercase tracking-wider">Total Room Dibuat</span>
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-foreground dark:text-white font-mono">{stats?.totalRooms ?? 0}</span>
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                                        ({stats?.totalActiveRooms ?? 0} Room Aktif)
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground dark:text-zinc-500">Total room temporary buatan user</p>
                            </div>

                            {/* Stat 3: Total Kas Server */}
                            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-colors sm:col-span-2 lg:col-span-1 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-zinc-400">
                                    <span className="font-semibold uppercase tracking-wider">Total Kas Dompet Server</span>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground dark:text-white font-mono">
                                        Rp {(stats?.totalWalletBalance ?? 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Saldo Kas Akumulasi Real-Time
                                </p>
                            </div>
                        </div>

                        {/* ========================================================================= */}
                        {/* 📊 VISUAL ANALYTICS CHARTS SECTION                                         */}
                        {/* ========================================================================= */}
                        
                        {/* TOP ROW CHARTS: USER GROWTH AREA + ROOM DISTRIBUTION DONUT */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* CHART 1: Smooth Area Line Chart (User Growth) */}
                            <div className="lg:col-span-6 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-4">
                                    <div>
                                        <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                            <LineChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            Grafik Pertumbuhan User (Monthly)
                                        </h3>
                                        <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5">Tren pendaftaran akun pengguna baru per bulan</p>
                                    </div>
                                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-indigo-500" /> +12.4% MoM
                                    </span>
                                </div>

                                <div className="h-56 w-full pt-4 flex flex-col justify-between relative">
                                    <div className="absolute inset-0 top-6 bottom-8 flex items-center justify-center pointer-events-none">
                                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d="M 0,130 Q 100,100 200,80 T 400,30 T 500,10 L 500,150 L 0,150 Z"
                                                fill="url(#userGrad)"
                                            />
                                            <path
                                                d="M 0,130 Q 100,100 200,80 T 400,30 T 500,10"
                                                fill="none"
                                                stroke="#6366f1"
                                                strokeWidth="3"
                                            />
                                        </svg>
                                    </div>

                                    <div className="grid grid-cols-6 items-end h-40 gap-3 z-10">
                                        {userGrowthData.map((d, idx) => (
                                            <div key={idx} className="flex flex-col items-center gap-2 group h-full justify-end">
                                                <span className="text-[10px] font-mono font-bold text-foreground dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity bg-background dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-border dark:border-zinc-800">
                                                    {d.count} User
                                                </span>
                                                <div 
                                                    className="w-full bg-gradient-to-t from-indigo-600/40 to-indigo-500 rounded-t-lg transition-all group-hover:scale-105"
                                                    style={{ height: `${(d.count / (stats?.totalUsers || 70)) * 100}%` }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-6 text-center text-xs font-semibold text-muted-foreground border-t border-border dark:border-zinc-800/80 pt-2 z-10">
                                        {userGrowthData.map((d, idx) => (
                                            <span key={idx}>{d.month}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CHART 2: Donut & Ratio Breakdown Chart (Room Types & Status) */}
                            <div className="lg:col-span-6 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-4">
                                    <div>
                                        <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                            <PieChart className="w-4 h-4 text-amber-500" />
                                            Distribusi Tipe & Status Room
                                        </h3>
                                        <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5">Proporsi room Public vs Private & status aktif</p>
                                    </div>
                                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                        Ratio Matrix
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                    {/* SVG Donut Ring Visual */}
                                    <div className="sm:col-span-5 relative flex items-center justify-center p-2">
                                        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                                            {/* Background Circle */}
                                            <path
                                                className="text-zinc-200 dark:text-zinc-800"
                                                strokeWidth="4"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            {/* Public Slices (Indigo) */}
                                            <path
                                                className="text-indigo-600 dark:text-indigo-500 transition-all duration-500"
                                                strokeDasharray="60, 100"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            {/* Private Slices (Amber) */}
                                            <path
                                                className="text-amber-500 transition-all duration-500"
                                                strokeDasharray="30, 100"
                                                strokeDashoffset="-60"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute text-center space-y-0.5">
                                            <span className="text-2xl font-extrabold text-foreground dark:text-white font-mono block">
                                                {stats?.totalRooms ?? 0}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                                Total Room
                                            </span>
                                        </div>
                                    </div>

                                    {/* Breakdown Legend Cards */}
                                    <div className="sm:col-span-7 space-y-3">
                                        {/* Public Rooms Legend */}
                                        <div className="bg-background dark:bg-zinc-950 p-2.5 rounded-xl border border-border dark:border-zinc-800 space-y-1 text-xs">
                                            <div className="flex items-center justify-between font-semibold">
                                                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                                    <Globe className="w-3.5 h-3.5" /> Room Public
                                                </span>
                                                <span className="font-mono font-bold text-foreground dark:text-white">60%</span>
                                            </div>
                                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '60%' }} />
                                            </div>
                                        </div>

                                        {/* Private Rooms Legend */}
                                        <div className="bg-background dark:bg-zinc-950 p-2.5 rounded-xl border border-border dark:border-zinc-800 space-y-1 text-xs">
                                            <div className="flex items-center justify-between font-semibold">
                                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                                    <Lock className="w-3.5 h-3.5" /> Room Private
                                                </span>
                                                <span className="font-mono font-bold text-foreground dark:text-white">40%</span>
                                            </div>
                                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }} />
                                            </div>
                                        </div>

                                        {/* Active Status Progress */}
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <span className="flex items-center gap-1">
                                                <Activity className="w-3.5 h-3.5" /> Status Room Berjalan
                                            </span>
                                            <span className="font-mono font-bold">
                                                {stats?.totalActiveRooms ?? 0} Room Aktif
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM ROW CHART: FINANCIAL CANDLESTICK MARKET PATTERN (Hijau & Merah Volatility Pattern) */}
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-sm">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border dark:border-zinc-800 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-emerald-500" />
                                            Pola Volatilitas & Arus Kas Server (Market Candlestick Pattern)
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                                            <TrendingUp className="w-3.5 h-3.5" /> +14.8% Bullish Flow
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1">
                                        Pola Candlestick finansial kas dompet server: Batang <span className="text-emerald-600 dark:text-emerald-400 font-bold">Hijau (Bullish Top Up)</span> dan <span className="text-rose-600 dark:text-rose-400 font-bold">Merah (Bearish Expiry/Penarikan)</span> dengan sumbu High-Low.
                                    </p>
                                </div>

                                {/* OHLC Legend */}
                                <div className="flex items-center gap-3 text-xs bg-background dark:bg-zinc-950 px-3.5 py-2 rounded-xl border border-border dark:border-zinc-800">
                                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Hijau = Bullish (Inflow)
                                    </span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Merah = Bearish (Outflow)
                                    </span>
                                </div>
                            </div>

                            {/* Summary Metrics Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="bg-background dark:bg-zinc-950 p-3 rounded-xl border border-border dark:border-zinc-800">
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Puncak Tertinggi (High)</span>
                                    <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">Rp 430.000</span>
                                </div>
                                <div className="bg-background dark:bg-zinc-950 p-3 rounded-xl border border-border dark:border-zinc-800">
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Titik Terendah (Low)</span>
                                    <span className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">Rp 100.000</span>
                                </div>
                                <div className="bg-background dark:bg-zinc-950 p-3 rounded-xl border border-border dark:border-zinc-800">
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Total Volume Kas Mingguan</span>
                                    <span className="text-sm font-mono font-bold text-foreground dark:text-white">Rp 4.120.000</span>
                                </div>
                                <div className="bg-background dark:bg-zinc-950 p-3 rounded-xl border border-border dark:border-zinc-800">
                                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Status Likuiditas</span>
                                    <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5" /> High Liquidity
                                    </span>
                                </div>
                            </div>

                            {/* Financial Candlestick Pattern Visual Grid */}
                            <div className="bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                                <div className="h-64 w-full flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 relative">
                                    
                                    {/* Horizontal Reference Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-border dark:border-zinc-700">
                                        <div className="border-b border-dashed border-foreground" />
                                        <div className="border-b border-dashed border-foreground" />
                                        <div className="border-b border-dashed border-foreground" />
                                        <div className="border-b border-dashed border-foreground" />
                                    </div>

                                    {/* Candlestick Columns */}
                                    {financialCandlestickData.map((c, idx) => {
                                        const maxVal = 450000;
                                        const minVal = 80000;
                                        const range = maxVal - minVal;

                                        const highPct = ((c.high - minVal) / range) * 100;
                                        const lowPct = ((c.low - minVal) / range) * 100;
                                        const openPct = ((c.open - minVal) / range) * 100;
                                        const closePct = ((c.close - minVal) / range) * 100;

                                        const bodyBottom = Math.min(openPct, closePct);
                                        const bodyHeight = Math.max(4, Math.abs(closePct - openPct));
                                        const isBullish = c.isBullish;

                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                                                
                                                {/* Tooltip Hover Popover */}
                                                <div className="absolute -top-20 z-30 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-zinc-900 text-white p-2.5 rounded-xl text-[10px] space-y-0.5 shadow-2xl border border-zinc-700 w-36 whitespace-nowrap">
                                                    <p className="font-bold border-b border-zinc-800 pb-1 flex items-center justify-between">
                                                        <span>{c.day}</span>
                                                        <span className={isBullish ? 'text-emerald-400' : 'text-rose-400'}>{c.change}</span>
                                                    </p>
                                                    <p className="text-zinc-300">Open: <span className="font-mono">Rp {(c.open / 1000).toFixed(0)}k</span></p>
                                                    <p className="text-zinc-300">Close: <span className="font-mono">Rp {(c.close / 1000).toFixed(0)}k</span></p>
                                                    <p className="text-zinc-400">High: <span className="font-mono">Rp {(c.high / 1000).toFixed(0)}k</span></p>
                                                    <p className="text-zinc-400">Low: <span className="font-mono">Rp {(c.low / 1000).toFixed(0)}k</span></p>
                                                </div>

                                                {/* Candlestick Body & Wick Container */}
                                                <div className="w-full relative h-48 flex items-center justify-center">
                                                    {/* High-Low Wick Vertical Line */}
                                                    <div 
                                                        className={`absolute w-0.5 transition-all ${isBullish ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                        style={{ 
                                                            bottom: `${lowPct}%`, 
                                                            height: `${highPct - lowPct}%` 
                                                        }}
                                                    />

                                                    {/* Open-Close Body Rect */}
                                                    <div
                                                        className={`absolute w-full max-w-[28px] rounded transition-all shadow-md group-hover:scale-110 ${
                                                            isBullish 
                                                                ? 'bg-emerald-500 border-2 border-emerald-400 shadow-emerald-500/20' 
                                                                : 'bg-rose-500 border-2 border-rose-400 shadow-rose-500/20'
                                                        }`}
                                                        style={{ 
                                                            bottom: `${bodyBottom}%`, 
                                                            height: `${bodyHeight}%` 
                                                        }}
                                                    />
                                                </div>

                                                {/* Volume Sub-Bar */}
                                                <div className="w-full pt-2 border-t border-border dark:border-zinc-800 flex flex-col items-center gap-1">
                                                    <div 
                                                        className={`w-full max-w-[20px] rounded-t ${isBullish ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`}
                                                        style={{ height: `${(c.volume / 1000000) * 24}px` }}
                                                    />
                                                    <span className="text-[11px] font-semibold text-muted-foreground">{c.day}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ========================================================================= */
                    /* 👥 DASHBOARD UNTUK USER BIASA                                            */
                    /* ========================================================================= */
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Quick Action Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Card 1: Buat Room Baru */}
                            <div className="md:col-span-6 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 border-b border-border dark:border-zinc-800 pb-3">
                                    <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="font-bold text-foreground dark:text-white text-base">Buat Room Baru Cepat</h3>
                                </div>

                                <form onSubmit={handleCreateRoom} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-foreground dark:text-zinc-300 mb-1">
                                            Nama Acara / Room
                                        </label>
                                        <input
                                            type="text"
                                            value={createRoomForm.data.name}
                                            onChange={e => createRoomForm.setData('name', e.target.value)}
                                            placeholder="Contoh: Kumpul Panitia / Patungan Pizza"
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-foreground dark:text-white focus:outline-none focus:border-indigo-500"
                                            required
                                        />
                                        {createRoomForm.errors.name && <p className="text-rose-500 text-[11px] mt-1">{createRoomForm.errors.name}</p>}
                                    </div>

                                    {/* Select Room Type (Public vs Private) */}
                                    <div>
                                        <label className="block text-xs font-medium text-foreground dark:text-zinc-300 mb-1">
                                            Tipe Akses Room
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => createRoomForm.setData('type', 'public')}
                                                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                                    createRoomForm.data.type === 'public'
                                                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                                                        : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 text-muted-foreground hover:border-zinc-400'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Globe className="w-3.5 h-3.5" /> Room Public
                                                </div>
                                                <span className="text-[10px] opacity-80 font-normal">Bebas masuk langsung via kode unik</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => createRoomForm.setData('type', 'private')}
                                                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                                    createRoomForm.data.type === 'private'
                                                        ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-bold shadow-sm'
                                                        : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 text-muted-foreground hover:border-zinc-400'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Lock className="w-3.5 h-3.5" /> Room Private
                                                </div>
                                                <span className="text-[10px] opacity-80 font-normal">Butuh persetujuan Owner untuk masuk</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-foreground dark:text-zinc-300 mb-1">
                                            Durasi Aktif Room (Auto-Destruct)
                                        </label>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {[1, 3, 6, 12, 24].map(dur => (
                                                <button
                                                    key={dur}
                                                    type="button"
                                                    onClick={() => createRoomForm.setData('duration_hours', dur)}
                                                    className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                        createRoomForm.data.duration_hours === dur
                                                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                                                            : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 text-muted-foreground hover:border-zinc-400'
                                                    }`}
                                                >
                                                    {dur} Jam
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={createRoomForm.processing}
                                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>{createRoomForm.processing ? 'Membuat Room...' : 'Bikin Room & Generate Kode'}</span>
                                    </button>
                                </form>
                            </div>

                            {/* Card 2: Masuk via Kode Unik */}
                            <div className="md:col-span-6 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 border-b border-border dark:border-zinc-800 pb-3 mb-4">
                                        <KeyRound className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                        <h3 className="font-bold text-foreground dark:text-white text-base">Masuk via Kode Room</h3>
                                    </div>

                                    <form onSubmit={handleJoinRoom} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-foreground dark:text-zinc-300 mb-1">
                                                Masukkan Kode Unik Room
                                            </label>
                                            <input
                                                type="text"
                                                value={joinRoomForm.data.code}
                                                onChange={e => joinRoomForm.setData('code', e.target.value.toUpperCase())}
                                                placeholder="Contoh: SR-8849"
                                                required
                                                className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-500 dark:text-amber-400 focus:outline-none focus:border-amber-500 uppercase"
                                            />
                                            {joinRoomForm.errors.code && <p className="text-rose-500 text-[11px] mt-1">{joinRoomForm.errors.code}</p>}
                                        </div>

                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Punya kode unik dari teman? Jika room Public Anda dapat langsung masuk, jika Private permintaan gabung akan dikirim ke Owner (berlaku 24 jam).
                                        </p>

                                        <button
                                            type="submit"
                                            disabled={joinRoomForm.processing}
                                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <LogIn className="w-4 h-4" />
                                            <span>{joinRoomForm.processing ? 'Menghubungkan...' : 'Gabung ke Room'}</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Section Pending Join Requests (24h Window) */}
                        {pendingJoinRequests && pendingJoinRequests.length > 0 && (
                            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                    <div>
                                        <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-amber-500" /> Permintaan Gabung Room Private ({pendingJoinRequests.length})
                                        </h3>
                                        <p className="text-xs text-muted-foreground">Status persetujuan pengajuan masuk room private dalam 24 jam terakhir</p>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground font-medium">Auto-expire 24 jam</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {pendingJoinRequests.map((req) => (
                                        <div key={req.id} className="bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="font-bold text-foreground dark:text-white text-sm flex items-center gap-2">
                                                    <span>{req.room_name}</span>
                                                    <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                        {req.room_code}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                    <span>Diajukan {req.created_at}</span>
                                                    <span>•</span>
                                                    <span>{req.time_left}</span>
                                                </div>
                                            </div>

                                            <div>
                                                {req.status === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                                                        <Clock className="w-3.5 h-3.5 animate-spin" /> Menunggu Respon Owner
                                                    </span>
                                                ) : req.status === 'rejected' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold">
                                                            <XCircle className="w-3.5 h-3.5" /> Ditolak Owner
                                                        </span>
                                                        <button
                                                            onClick={() => handleDismissRequest(req.id)}
                                                            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors"
                                                            title="Hapus notifikasi"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* List Room Saya (Baik Owner maupun Joined Member) */}
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <div>
                                    <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Riwayat & Room Aktif Saya ({rooms?.length || 0})
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Menampilkan room buatanmu dan room yang kamu ikuti</p>
                                </div>
                                <span className="text-xs text-muted-foreground">Auto-destruct timer aktif</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rooms?.map((room, idx) => {
                                    const isOwner = room.is_owner || room.role_in_room === 'owner';
                                    const isBendahara = room.role_in_room === 'bendahara';
                                    const isJoined = room.is_joined ?? true;
                                    const isExpired = room.is_expired ?? false;
                                    const isPrivate = room.type === 'private';

                                    return (
                                        <div key={room.id} className="bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl p-4 space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-foreground dark:text-white text-sm">{room.name}</h4>
                                                        {isPrivate ? (
                                                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-0.5" title="Room Private (Butuh Izin Owner)">
                                                                <Lock className="w-2.5 h-2.5" /> Private
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-0.5" title="Room Public (Bebas Masuk)">
                                                                <Globe className="w-2.5 h-2.5" /> Public
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        {isOwner ? (
                                                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                                                <Crown className="w-2.5 h-2.5" /> Owner Room
                                                            </span>
                                                        ) : isBendahara ? (
                                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                                                <Coins className="w-2.5 h-2.5" /> Bendahara
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                                                                <UserIcon className="w-2.5 h-2.5" /> Anggota
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-500 dark:text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                                                    {room.code}
                                                    <button onClick={() => handleCopyCode(room.code, idx)} className="hover:text-foreground">
                                                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs pt-2 border-t border-border dark:border-zinc-900">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-zinc-400" /> 
                                                    {isExpired ? (
                                                        <strong className="text-rose-500">Kadaluarsa</strong>
                                                    ) : (
                                                        <span>Durasi: <strong>{room.duration_hours}h</strong></span>
                                                    )}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    {/* Hapus Riwayat Button logic */}
                                                    <button
                                                        onClick={() => handleRemoveHistory(room.id, isJoined, isExpired)}
                                                        className={`text-xs px-2 py-1 rounded border flex items-center gap-1 transition-colors ${
                                                            isJoined && !isExpired
                                                                ? 'text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 cursor-not-allowed opacity-60'
                                                                : 'text-rose-500 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20'
                                                        }`}
                                                        title={isJoined && !isExpired ? 'Keluar dari room dulu sebelum menghapus riwayat' : 'Hapus riwayat dari dashboard'}
                                                    >
                                                        {isJoined && !isExpired ? <Lock className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                                                        <span>Hapus Riwayat</span>
                                                    </button>

                                                    {!isExpired && (
                                                        <a
                                                            href={`/rooms/${room.code}`}
                                                            className="text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1 shadow-sm"
                                                        >
                                                            Chat <ArrowRight className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(!rooms || rooms.length === 0) && (
                                    <p className="text-xs text-muted-foreground col-span-2 text-center py-6">
                                        Belum ada riwayat room yang kamu buat atau ikuti.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
