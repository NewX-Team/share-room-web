import { Head, Link, usePage } from '@inertiajs/react';
import FlashNotifier from '@/components/flash-notifier';
import { dashboard, login, register } from '@/routes';
import { useState, useEffect } from 'react';
import { 
    Clock, 
    Wallet, 
    Users, 
    KeyRound, 
    MessageCircle, 
    ArrowRight, 
    Plus, 
    Check, 
    Timer, 
    Send, 
    Zap, 
    Shield, 
    Sparkles, 
    Copy, 
    CheckCheck,
    Coins,
    Coffee,
    PartyPopper,
    Receipt
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props;

    // Interactive Widget State
    const [mode, setMode] = useState<'create' | 'join'>('create');
    
    // Create Room Form State
    const [roomTitle, setRoomTitle] = useState('Nongkrong Sate & Es Jeruk');
    const [durationHours, setDurationHours] = useState<number>(3);
    const [generatedCode, setGeneratedCode] = useState('ROOM-8492');
    const [copiedCode, setCopiedCode] = useState(false);

    // Join Room Form State
    const [joinCodeInput, setJoinCodeInput] = useState('ROOM-8492');

    // Wallet Simulator State
    const [walletTotal, setWalletTotal] = useState<number>(140000);
    const [members, setMembers] = useState([
        { id: 1, name: 'Budi (Pembuat Room)', amount: 50000, status: 'Lunas', time: '10 menit lalu', bg: 'bg-indigo-600' },
        { id: 2, name: 'Siti Rahma', amount: 40000, status: 'Lunas', time: '5 menit lalu', bg: 'bg-emerald-600' },
        { id: 3, name: 'Rian Febrian', amount: 50000, status: 'Lunas', time: 'Baru saja', bg: 'bg-amber-600' },
    ]);
    const [customPay, setCustomPay] = useState('20000');
    const [notification, setNotification] = useState<string | null>(null);

    // Simulated Timer Countdown
    const [secondsLeft, setSecondsLeft] = useState(3 * 3600 - 120); // 2 jam 58m

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (totalSec: number) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleCopyCode = () => {
        navigator.clipboard?.writeText(generatedCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleQuickAddCash = (amount: number) => {
        setWalletTotal(prev => prev + amount);
        setMembers(prev => [
            {
                id: Date.now(),
                name: 'Kamu (Saya)',
                amount: amount,
                status: 'Lunas',
                time: 'Baru saja',
                bg: 'bg-rose-600'
            },
            ...prev
        ]);
        setNotification(`+ Rp ${amount.toLocaleString('id-ID')} masuk ke kas dompet room!`);
        setTimeout(() => setNotification(null), 3500);
    };

    const handleCustomPaySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseInt(customPay.replace(/\D/g, ''), 10);
        if (val && val > 0) {
            handleQuickAddCash(val);
            setCustomPay('');
        }
    };

    return (
        <>
            <Head title="ShareRoom — Grup Chat Sementara & Kas Patungan" />
            <FlashNotifier />

            <div className="min-h-screen bg-[#0e0f12] text-zinc-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
                {/* Clean Subtle Grid Pattern Background */}
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* Top Navigation */}
                <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0e0f12]/80 border-b border-zinc-800/80">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        {/* Brand Logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-lg tracking-tight text-white">
                                ShareRoom
                            </span>
                        </div>

                        {/* Nav Items */}
                        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400 font-medium">
                            <a href="#simulasi" className="hover:text-zinc-200 transition-colors">Coba Room</a>
                            <a href="#dompet" className="hover:text-zinc-200 transition-colors">Dompet Kas</a>
                            <a href="#keunggulan" className="hover:text-zinc-200 transition-colors">Kenapa ShareRoom?</a>
                        </div>

                        {/* Auth / Action */}
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                    <span>Buka Dashboard</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all shadow-sm"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-12 pb-14 sm:pt-20 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
                    {/* Casual Tag Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Grup Chat Sementara & Dompet Urunan</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight max-w-4xl mx-auto">
                        Nongkrong & Patungan Seru, <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-zinc-200 to-amber-300">
                            Room Otomatis Hapus Sendiri.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Bikin grup obrolan tanpa bikin memori HP penuh. Cukup bagikan kode 6-digit ke teman. Lengkap sama dompet kas untuk urunan bayar bareng secara transparan!
                    </p>

                    {/* Quick CTA */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <a
                            href="#simulasi"
                            className="px-5 py-3 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                            <span>Coba Simulasi Bikin Room</span>
                        </a>
                        <a
                            href="#dompet"
                            className="px-5 py-3 rounded-xl font-medium text-sm text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center gap-2"
                        >
                            <Wallet className="w-4 h-4 text-emerald-400" />
                            <span>Lihat Dompet Kas</span>
                        </a>
                    </div>
                </section>

                {/* Section Simulasi (Interactive App Playground) */}
                <section id="simulasi" className="py-10 px-4 sm:px-6 max-w-5xl mx-auto">
                    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
                        
                        {/* Tab Selector */}
                        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 flex-wrap gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white">Simulasi Room Chat</h2>
                                <p className="text-xs text-zinc-400 mt-0.5">Coba alur membuat & masuk ke dalam room sementara</p>
                            </div>

                            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-medium">
                                <button
                                    onClick={() => setMode('create')}
                                    className={`px-4 py-2 rounded-lg transition-all ${
                                        mode === 'create'
                                            ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    1. Bikin Room Baru
                                </button>
                                <button
                                    onClick={() => setMode('join')}
                                    className={`px-4 py-2 rounded-lg transition-all ${
                                        mode === 'join'
                                            ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    2. Masuk Pake Kode
                                </button>
                            </div>
                        </div>

                        {/* Mode 1: Bikin Room */}
                        {mode === 'create' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                                {/* Left Form */}
                                <div className="lg:col-span-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                                            Nama Acara / Room
                                        </label>
                                        <input
                                            type="text"
                                            value={roomTitle}
                                            onChange={e => setRoomTitle(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                            placeholder="Misal: Nongkrong Warkop / Futsal Sabtu"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                                            Atur Durasi Aktif Room
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 3, 12, 24].map((hr) => (
                                                <button
                                                    key={hr}
                                                    type="button"
                                                    onClick={() => setDurationHours(hr)}
                                                    className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                                                        durationHours === hr
                                                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                                    }`}
                                                >
                                                    {hr} Jam
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs space-y-1.5 text-zinc-400">
                                            <p className="flex items-center gap-1.5 font-medium text-zinc-300">
                                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                Auto-Destruct Policy:
                                            </p>
                                            <p>
                                                Setelah <strong className="text-zinc-200">{durationHours} Jam</strong> berlalu, room & seluruh isi pesan otomatis terhapus tanpa sisa dari server.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Output Card */}
                                <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-zinc-900 text-xs">
                                            <span className="text-zinc-500 font-medium">Tampilan Room Hasil Bikin</span>
                                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-base text-white">{roomTitle || 'Nama Room'}</h3>
                                            <p className="text-xs text-zinc-400 mt-0.5">Durasi Diberikan: {durationHours} Jam</p>
                                        </div>

                                        {/* Display Kode Unik */}
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-center space-y-1">
                                            <p className="text-[11px] text-zinc-400 font-medium">KODE UNIK UNTUK ANGGOTA LAIN</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="font-mono text-2xl font-bold tracking-wider text-amber-400">
                                                    {generatedCode}
                                                </span>
                                                <button
                                                    onClick={handleCopyCode}
                                                    className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-800 transition-colors"
                                                    title="Salin Kode"
                                                >
                                                    {copiedCode ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Live Timer Countdown */}
                                        <div className="flex items-center justify-between text-xs bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                                            <span className="text-zinc-400 flex items-center gap-1.5">
                                                <Timer className="w-3.5 h-3.5 text-amber-400" /> Sisa Waktu Room:
                                            </span>
                                            <span className="font-mono font-bold text-zinc-200">
                                                {formatTime(secondsLeft)}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-zinc-500 mt-4">
                                        *Siapapun yang punya kode <span className="font-mono text-zinc-300">{generatedCode}</span> bisa bergabung langsung tanpa perlu bikin akun rumit.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Mode 2: Masuk Pake Kode */}
                        {mode === 'join' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                                <div className="lg:col-span-5 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                                            Masukkan Kode Unik Room
                                        </label>
                                        <input
                                            type="text"
                                            value={joinCodeInput}
                                            onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 font-mono text-base font-bold text-amber-400 tracking-wider focus:outline-none focus:border-indigo-500 uppercase"
                                            placeholder="ROOM-8492"
                                        />
                                    </div>

                                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 space-y-1">
                                        <p className="text-zinc-200 font-semibold flex items-center gap-1.5">
                                            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Riwayat Chat Aman
                                        </p>
                                        <p>
                                            Gak sengaja kepencet keluar dari browser? Tinggal masukkan kode unik ini lagi. Selama durasi room belum abis, seluruh obrolan & saldo kas tetep ada!
                                        </p>
                                    </div>
                                </div>

                                {/* Chat Feed Preview */}
                                <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between h-70">
                                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900 text-xs">
                                        <span className="font-bold text-white">Room: {roomTitle}</span>
                                        <span className="font-mono text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                                            {joinCodeInput}
                                        </span>
                                    </div>

                                    {/* Messages */}
                                    <div className="space-y-2.5 my-auto text-xs overflow-y-auto pr-1">
                                        <div className="flex items-start gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">B</div>
                                            <div className="bg-zinc-900 p-2 rounded-xl rounded-tl-none border border-zinc-800 max-w-[80%]">
                                                <p className="font-semibold text-zinc-400 text-[10px]">Budi</p>
                                                <p className="text-zinc-200">Udah pada kumpul di lokasi warkop belom?</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[10px] text-white">S</div>
                                            <div className="bg-zinc-900 p-2 rounded-xl rounded-tl-none border border-zinc-800 max-w-[80%]">
                                                <p className="font-semibold text-zinc-400 text-[10px]">Siti</p>
                                                <p className="text-zinc-200">Pengingat patungan telah diatur di dompet kas room.</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="bg-indigo-600 text-white p-2 rounded-xl rounded-tr-none max-w-[80%]">
                                                <p className="text-[11px]">Siap, transaksi kas Rp 20.000 sudah berhasil disetor.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mock Input */}
                                    <div className="pt-2 border-t border-zinc-900 flex gap-2">
                                        <input
                                            type="text"
                                            disabled
                                            placeholder="Ketik pesan..."
                                            className="w-full bg-zinc-900 text-xs text-zinc-500 rounded-lg px-3 py-1.5 border border-zinc-800 cursor-not-allowed"
                                        />
                                        <button disabled className="p-1.5 rounded-lg bg-indigo-600 text-white opacity-50 cursor-not-allowed">
                                            <Send className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section Dompet Kas Room */}
                <section id="dompet" className="py-14 px-4 sm:px-6 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* Description Left */}
                        <div className="lg:col-span-6 space-y-4">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                <Coins className="w-3.5 h-3.5" /> Fitur Dompet Kas Room
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                                Patungan & Bayar Bareng <br />
                                <span className="text-emerald-400">Gak Pake Ribet Minta Rekening.</span>
                            </h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Setiap room yang kamu buat punya dompet digital kas sendiri. Cocok banget buat patungan makan, bayar parkir, sewa venue, atau kado ulang tahun teman.
                            </p>

                            <div className="space-y-2.5 text-xs text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span><strong>Transparan:</strong> Siapa yang udah bayar & siapa yang belum kelihatan jelas.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span><strong>Praktis:</strong> Langsung gunakan saldo kas room untuk bayar kebutuhan bareng.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span><strong>Otomatis Beres:</strong> Sisa uang dompet kas bisa dibagi balik sebelum room abis.</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Wallet Card Right */}
                        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
                            
                            {/* Card Header Balance */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between text-xs text-zinc-400">
                                    <span>Total Saldo Kas Room</span>
                                    <span className="text-emerald-400 font-medium">Dompet Active</span>
                                </div>
                                <p className="text-3xl font-bold font-mono text-white mt-1">
                                    Rp {walletTotal.toLocaleString('id-ID')}
                                </p>
                            </div>

                            {/* Action Quick Add */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-zinc-300">Cobain Tambah Urunan (Simulasi):</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleQuickAddCash(10000)}
                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium rounded-lg border border-zinc-700 transition-colors"
                                    >
                                        + Rp 10.000
                                    </button>
                                    <button
                                        onClick={() => handleQuickAddCash(25000)}
                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium rounded-lg border border-zinc-700 transition-colors"
                                    >
                                        + Rp 25.000
                                    </button>
                                    <button
                                        onClick={() => handleQuickAddCash(50000)}
                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium rounded-lg border border-zinc-700 transition-colors"
                                    >
                                        + Rp 50.000
                                    </button>
                                </div>
                            </div>

                            {notification && (
                                <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                                    {notification}
                                </p>
                            )}

                            {/* Contributor History */}
                            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                                <p className="text-xs font-semibold text-zinc-400">Daftar Patungan Anggota:</p>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                    {members.map(m => (
                                        <div key={m.id} className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full ${m.bg} flex items-center justify-center font-bold text-white text-[10px]`}>
                                                    {m.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-zinc-200">{m.name}</span>
                                            </div>
                                            <span className="font-mono font-bold text-emerald-400">
                                                Rp {m.amount.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Section Kenapa ShareRoom? (Casual Value Props) */}
                <section id="keunggulan" className="py-14 px-4 sm:px-6 max-w-5xl mx-auto border-t border-zinc-900">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">Kenapa Enak Pake ShareRoom?</h2>
                        <p className="text-zinc-400 text-xs sm:text-sm mt-1">Didesain kasual buat kamu yang pengen obrolan cepat & praktis tanpa beban memori.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-xl space-y-2">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                                <Timer className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-white text-sm">Hapus Otomatis</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Bebas menentukan timer. Begitu masa aktif habis, chat dan media dibersihkan otomatis.
                            </p>
                        </div>

                        <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-xl space-y-2">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-white text-sm">Cukup Kode Unik</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Tidak perlu menambah kontak atau membuat grup baru. Cukup bagikan kode unik room.
                            </p>
                        </div>

                        <div className="bg-zinc-900/70 border border-zinc-800 p-5 rounded-xl space-y-2">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-white text-sm">Dompet Kas Bersama</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Patungan uang terdata secara transparan. Rincian pembayar dan saldo kas terlihat langsung.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-zinc-900 py-10 px-4 sm:px-6 max-w-5xl mx-auto text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                            S
                        </div>
                        <span className="font-medium text-zinc-300">ShareRoom</span>
                        <span>— Group Chat & Kas Patungan</span>
                    </div>

                    <p>© {new Date().getFullYear()} ShareRoom. Simple & Temporary.</p>
                </footer>
            </div>
        </>
    );
}
