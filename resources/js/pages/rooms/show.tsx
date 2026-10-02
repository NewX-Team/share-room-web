import { Head, useForm, usePage, router, usePoll } from '@inertiajs/react';
import { getSwalConfig, showConfirmDialog, showErrorAlert, showInfoAlert, showSuccessAlert, showWarningAlert } from '@/lib/swal';
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
    ArrowRight,
    Paperclip,
    FileArchive,
    FileText,
    File,
    Image as ImageIcon,
    Download,
    Flag,
    Pin,
    QrCode,
    Building2,
    Receipt,
    SendHorizontal,
    ScanLine,
    UploadCloud,
    CheckCircle,
    ExternalLink,
    History,
    DollarSign,
    Info
} from 'lucide-react';
import React, { useState, useEffect, useRef, Fragment } from 'react';
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
    file_path?: string | null;
    file_name?: string | null;
    file_type?: string | null;
    file_size?: number | null;
    is_pinned?: boolean;
}

interface PinnedMessageData {
    id: number;
    user_id: number;
    user_name: string;
    message: string;
    time: string;
    file_name?: string | null;
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

interface RoomInvoiceData {
    id: number;
    invoice_number: string;
    user_name: string;
    feature_name: string;
    amount: number;
    duration_hours: number;
    paid_at: string;
}

interface ReportData {
    id: number;
    reporter_id: number;
    reporter_name: string;
    reported_id: number;
    reported_name: string;
    reason_category: string;
    description?: string | null;
    created_at: string;
}

interface ExtensionPackageData {
    id: number;
    hours: number;
    price: number;
}

interface WalletPaymentData {
    id: number;
    payment_number: string;
    user_name: string;
    payment_method: string;
    recipient_name: string;
    recipient_account?: string | null;
    bank_name?: string | null;
    qris_image_path?: string | null;
    amount: number;
    notes?: string | null;
    created_at: string;
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
        is_premium?: boolean;
        premium_price?: number;
        user_role_in_room?: 'owner' | 'bendahara' | 'member';
        can_use_wallet?: boolean;
    };
    members: MemberData[];
    messages: MessageData[];
    announcements?: AnnouncementData[];
    pendingRequests?: PendingJoinRequestData[];
    reports?: ReportData[];
    userFileCount?: number;
    maxFiles?: number;
    lastReadMessageId?: number | null;
    invoices?: RoomInvoiceData[];
    extensionPackages?: ExtensionPackageData[];
    pinnedMessages?: PinnedMessageData[];
    walletPayments?: WalletPaymentData[];
}

export default function RoomShow({ 
    room, 
    members, 
    messages, 
    announcements = [], 
    pendingRequests = [],
    reports = [],
    userFileCount = 0,
    maxFiles = 20,
    lastReadMessageId = null,
    invoices = [],
    extensionPackages = [],
    pinnedMessages = [],
    walletPayments = [],
}: RoomDetailProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUser = auth?.user;
    const currentMember = members.find(m => m.user_id === currentUser?.id);
    const currentMemberRole = room.user_role_in_room || currentMember?.role_in_room || (room.is_owner ? 'owner' : 'member');
    const canUseWallet = room.can_use_wallet ?? (room.is_owner || currentMemberRole === 'bendahara' || currentUser?.role === 'admin');
    const isOwnerOrAdmin = room.is_owner || currentUser?.role === 'admin';

    // Enable Inertia Real-Time Polling Sync every 2 seconds
    usePoll(2000, {
        only: [
            'messages',
            'room',
            'members',
            'announcements',
            'pendingRequests',
            'reports',
            'userFileCount',
            'invoices',
            'extensionPackages',
            'pinnedMessages',
            'walletPayments'
        ]
    }, {
        keepAlive: true
    });

    // Ref untuk Scroll Posisi Chat & Container
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);
    const prevMessagesLength = useRef(messages?.length || 0);

    // Audio chime notification for incoming real-time messages from other users
    const playMessageChime = () => {
        try {
            const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } catch {
            // Audio blocked by browser policy until user interacts
        }
    };

    // Smart Auto Scroll: Ke pesan pertama belum dibaca saat mount, atau scroll otomatis saat pesan baru masuk
    useEffect(() => {
        if (!messages || messages.length === 0) return;

        if (isInitialMount.current) {
            isInitialMount.current = false;
            prevMessagesLength.current = messages.length;

            let unreadTargetId: number | null = null;
            if (lastReadMessageId) {
                const firstUnread = messages.find(m => m.id > lastReadMessageId);
                if (firstUnread) {
                    unreadTargetId = firstUnread.id;
                }
            }

            const timer = setTimeout(() => {
                if (unreadTargetId) {
                    const el = document.getElementById(`msg-${unreadTargetId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        return;
                    }
                }
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 200);

            return () => clearTimeout(timer);
        }

        // Subsequent real-time updates: check if new messages arrived
        if (messages.length > prevMessagesLength.current) {
            const lastMsg = messages[messages.length - 1];
            const isMyMessage = lastMsg?.user_id === currentUser?.id;

            if (!isMyMessage) {
                playMessageChime();
            }

            const container = chatContainerRef.current;
            const isNearBottom = container
                ? container.scrollHeight - container.scrollTop - container.clientHeight < 250
                : true;

            if (isMyMessage || isNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
            prevMessagesLength.current = messages.length;
        }
    }, [messages, lastReadMessageId, currentUser?.id]);

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

    // State Modal Upgrade Premium & Invoice
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [isBuyingPremium, setIsBuyingPremium] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<RoomInvoiceData | null>(null);

    // State Modal Perpanjang Durasi Room
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [selectedExtensionId, setSelectedExtensionId] = useState<number | null>(null);
    const [isExtendingDuration, setIsExtendingDuration] = useState(false);

    // State Modal Pembayaran Kas Digital (Disbursement) ke Pihak Ke-3
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentTab, setPaymentTab] = useState<'qris' | 'invoice' | 'va'>('qris');
    const [paymentMethod, setPaymentMethod] = useState<'qris' | 'virtual_account' | 'bank_transfer' | 'ewallet'>('qris');
    const [paymentRecipientName, setPaymentRecipientName] = useState<string>('');
    const [paymentRecipientAccount, setPaymentRecipientAccount] = useState<string>('');
    const [paymentBankName, setPaymentBankName] = useState<string>('BCA');
    const [paymentAmountInput, setPaymentAmountInput] = useState<string>('0');
    const [paymentNotes, setPaymentNotes] = useState<string>('');
    const [qrisFile, setQrisFile] = useState<File | null>(null);
    const [qrisPreview, setQrisPreview] = useState<string | null>(null);
    const [isDetectingQris, setIsDetectingQris] = useState(false);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
    const [invoiceInputText, setInvoiceInputText] = useState<string>('');
    const [isDetectingInvoice, setIsDetectingInvoice] = useState(false);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    // Modal Struk Pembayaran & Riwayat
    const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState<WalletPaymentData | null>(null);
    const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);

    const handleOpenPaymentModal = () => {
        if (!canUseWallet) {
            showInfoAlert('Hanya Owner Room dan Bendahara yang memiliki wewenang untuk mengeksekusi pembayaran dari saldo kas digital.', 'Akses Terbatas');
            return;
        }
        setPaymentTab('qris');
        setPaymentMethod('qris');
        setPaymentRecipientName('');
        setPaymentRecipientAccount('');
        setPaymentBankName('BCA');
        setPaymentAmountInput('0');
        setPaymentNotes('');
        setQrisFile(null);
        setQrisPreview(null);
        setInvoiceFile(null);
        setInvoicePreview(null);
        setInvoiceInputText('');
        setShowPaymentModal(true);
    };

    // Handler Detect / Scan QRIS File
    const handleQrisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setQrisFile(file);
        setQrisPreview(URL.createObjectURL(file));

        setIsDetectingQris(true);
        const formData = new FormData();
        formData.append('qris_image', file);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/rooms/${room.code}/wallet-payment/detect-qris`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setPaymentRecipientName(data.merchant_name || 'Merchant QRIS Resmi');
                setPaymentRecipientAccount(data.recipient_account || 'ID1020304050607');
                setPaymentBankName(data.bank_name || 'QRIS National');
                setPaymentAmountInput(data.amount ? String(data.amount) : '20000');
                showSuccessAlert(`Foto QRIS berhasil didekomposisi! Terdeteksi ${data.merchant_name} (Rp ${(data.amount || 20000).toLocaleString('id-ID')})`, 'QRIS Terdeteksi');
            }
        } catch {
            showInfoAlert('Foto QRIS diunggah. Silakan konfirmasi nominal pembayaran.', 'QRIS Terbaca');
        } finally {
            setIsDetectingQris(false);
        }
    };

    // Handler Detect / Scan Invoice Screenshot or PDF File
    const handleInvoiceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setInvoiceFile(file);
        setInvoicePreview(URL.createObjectURL(file));

        setIsDetectingInvoice(true);
        const formData = new FormData();
        formData.append('invoice_image', file);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/rooms/${room.code}/wallet-payment/detect-invoice`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setPaymentRecipientName(data.merchant_name || 'Gacoan (Midtrans Invoice)');
                setPaymentRecipientAccount(data.recipient_account || '893d504e-1128-4fce-ba9c-bf592762bf9a');
                setPaymentBankName(data.bank_name || 'Midtrans Payment Link');
                setPaymentAmountInput(data.amount ? String(data.amount) : '36000');
                if (data.notes) setPaymentNotes(data.notes);
                showSuccessAlert(data.message || `Invoice berhasil terdeteksi! Total tagihan: Rp ${(data.amount || 36000).toLocaleString('id-ID')}`, 'Invoice Terdeteksi');
            }
        } catch {
            showInfoAlert('Foto Invoice diunggah. Silakan konfirmasi nominal pembayaran.', 'Invoice Terbaca');
        } finally {
            setIsDetectingInvoice(false);
        }
    };

    // Handler Detect Invoice Link / Invoice ID Input Text
    const handleInvoiceInputDetect = async () => {
        if (!invoiceInputText.trim()) {
            showErrorAlert('Silakan masukkan nomor invoice atau Payment Link URL.', 'Input Kosong');
            return;
        }

        setIsDetectingInvoice(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/rooms/${room.code}/wallet-payment/detect-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ invoice_input: invoiceInputText }),
            });
            const data = await res.json();
            if (data.success) {
                setPaymentRecipientName(data.merchant_name || 'Gacoan (Midtrans Invoice)');
                setPaymentRecipientAccount(data.recipient_account || '893d504e-1128-4fce-ba9c-bf592762bf9a');
                setPaymentBankName(data.bank_name || 'Midtrans Payment Link');
                setPaymentAmountInput(data.amount ? String(data.amount) : '36000');
                if (data.notes) setPaymentNotes(data.notes);
                showSuccessAlert(data.message || `Tagihan invoice berhasil terdeteksi! Total: Rp ${(data.amount || 36000).toLocaleString('id-ID')}`, 'Tagihan Terdeteksi');
            }
        } catch {
            showInfoAlert('Nomor invoice terverifikasi. Silakan konfirmasi nominal pembayaran.', 'Invoice Terbaca');
        } finally {
            setIsDetectingInvoice(false);
        }
    };



    // Handler Submit Payment to Third Party
    const handleExecutePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!canUseWallet) {
            showErrorAlert('Hanya Owner Room dan Bendahara yang berwenang melakukan pembayaran dari saldo kas digital.', 'Akses Terbatas');
            return;
        }

        if (room.is_frozen) {
            showErrorAlert('Dompet Kas Digital sedang dibekukan oleh Admin.', 'Terkunci');
            return;
        }

        const amt = parseFloat(paymentAmountInput) || 0;
        if (amt < 1000) {
            showErrorAlert('Nominal pembayaran minimal Rp 1.000.', 'Nominal Tidak Valid');
            return;
        }

        // Check if balance is insufficient
        if (room.wallet_balance < amt) {
            const shortage = amt - room.wallet_balance;
            showConfirmDialog({
                title: 'Saldo Kas Tidak Cukup',
                text: `Saldo kas digital room (Rp ${room.wallet_balance.toLocaleString('id-ID')}) kurang Rp ${shortage.toLocaleString('id-ID')} untuk membayar ${paymentRecipientName || 'Pihak Ke-3'} sebesar Rp ${amt.toLocaleString('id-ID')}. Lakukan Top Up sekarang?`,
                confirmButtonText: 'Top Up Saldo Kas Sekarang',
                cancelButtonText: 'Batal',
                icon: 'warning',
            }, () => {
                setShowPaymentModal(false);
                setCustomNominalInput(String(Math.ceil(shortage)));
                setSelectedNominal(Math.ceil(shortage));
                setShowTopUpModal(true);
            });
            return;
        }

        if (!paymentRecipientName.trim()) {
            showErrorAlert('Silakan isi Nama Penerima / Merchant pihak ke-3.', 'Nama Penerima Wajib');
            return;
        }

        setIsSubmittingPayment(true);

        const formData = new FormData();
        formData.append('amount', String(amt));
        formData.append('payment_method', paymentMethod);
        formData.append('recipient_name', paymentRecipientName);
        formData.append('recipient_account', paymentRecipientAccount || '');
        formData.append('bank_name', paymentBankName);
        formData.append('notes', paymentNotes);
        if (qrisFile) {
            formData.append('qris_image', qrisFile);
        }

        router.post(`/rooms/${room.code}/wallet-payment`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingPayment(false);
                setShowPaymentModal(false);
                // Reset form
                setPaymentRecipientName('');
                setPaymentRecipientAccount('');
                setPaymentNotes('');
                setQrisFile(null);
                setQrisPreview(null);
                showSuccessAlert(`Pembayaran Rp ${amt.toLocaleString('id-ID')} ke ${paymentRecipientName} berhasil dilaksanakan! Struk telah diterbitkan di room chat.`, 'Pembayaran Berhasil!');
            },
            onError: () => {
                setIsSubmittingPayment(false);
            }
        });
    };

    const handleTogglePinMessage = (messageId: number, isCurrentlyPinned?: boolean) => {
        if (!isOwnerOrAdmin) {
            showErrorAlert('Hanya Owner Room yang memiliki wewenang untuk menyematkan atau melepas sematan pesan.', 'Akses Terbatas');
            return;
        }

        router.post(`/rooms/${room.code}/messages/${messageId}/toggle-pin`, {}, {
            preserveScroll: true,
        });
    };

    const handleScrollToMessage = (messageId: number) => {
        const el = document.getElementById(`msg-${messageId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleExtendDurationSubmit = () => {
        if (!selectedExtensionId) return;

        const pkg = extensionPackages.find(p => p.id === selectedExtensionId);
        if (!pkg) return;

        if (!canUseWallet) {
            showErrorAlert('Hanya Owner Room dan Bendahara yang memiliki wewenang untuk memperpanjang durasi menggunakan saldo kas digital.', 'Akses Terbatas');
            return;
        }

        if (room.wallet_balance < pkg.price) {
            showConfirmDialog({
                title: 'Saldo Dompet Kas Tidak Cukup',
                text: `Saldo kas digital room saat ini (Rp ${room.wallet_balance.toLocaleString('id-ID')}) tidak mencukupi untuk memperpanjang durasi +${pkg.hours} Jam (Harga: Rp ${pkg.price.toLocaleString('id-ID')}). Silakan lakukan Top Up Saldo Kas terlebih dahulu.`,
                confirmButtonText: 'Top Up Saldo Kas Sekarang',
                cancelButtonText: 'Batal',
                icon: 'warning',
            }, () => {
                setShowExtendModal(false);
                setShowTopUpModal(true);
            });
            return;
        }

        showConfirmDialog({
            title: `Perpanjang Durasi Room +${pkg.hours} Jam?`,
            text: `Apakah Anda yakin ingin memperpanjang durasi room sebanyak +${pkg.hours} Jam seharga Rp ${pkg.price.toLocaleString('id-ID')}? Saldo kas digital room akan dipotong otomatis.`,
            confirmButtonText: 'Ya, Perpanjang Sekarang',
            cancelButtonText: 'Batal',
            icon: 'question',
        }, () => {
            setIsExtendingDuration(true);
            router.post(`/rooms/${room.code}/extend-duration`, { package_id: pkg.id }, {
                preserveScroll: true,
                onFinish: () => {
                    setIsExtendingDuration(false);
                    setShowExtendModal(false);
                },
            });
        });
    };

    // State Modal Report Member (User side) & Owner Report Panel (Owner side)
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReportMember, setSelectedReportMember] = useState<{ id: number; name: string } | null>(null);
    const [showOwnerReportsModal, setShowOwnerReportsModal] = useState(false);

    const reportForm = useForm({
        reported_id: 0,
        reason_category: 'Perilaku Tidak Menyenangkan',
        description: '',
    });

    const handleOpenReportModal = (memberId: number, memberName: string) => {
        setSelectedReportMember({ id: memberId, name: memberName });
        reportForm.setData({
            reported_id: memberId,
            reason_category: 'Perilaku Tidak Menyenangkan',
            description: '',
        });
        setShowReportModal(true);
    };

    const handleSubmitReport = (e: React.FormEvent) => {
        e.preventDefault();
        reportForm.post(`/rooms/${room.code}/report`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReportModal(false);
                showSuccessAlert('Laporan Anda berhasil dikirim ke Owner room.', 'Laporan Terkirim');
            },
        });
    };

    const handleDismissReport = (reportId: number, reportedName: string) => {
        showConfirmDialog({
            title: `Abaikan Laporan terhadap ${reportedName}?`,
            text: 'Laporan ini akan diabaikan dan member terlapor tetap dipertahankan di dalam room.',
            confirmButtonText: 'Ya, Abaikan & Pertahankan',
            cancelButtonText: 'Batal',
            icon: 'question',
        }, () => {
            router.post(`/rooms/${room.code}/reports/${reportId}/dismiss`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleKickReportedMember = (reportId: number, reportedName: string) => {
        showConfirmDialog({
            title: `Kick ${reportedName} Berdasarkan Laporan?`,
            text: 'Member terlapor akan dikeluarkan dari room dan pemberitahuan resmi akan dikirim ke riwayat room dashboard user tersebut.',
            confirmButtonText: 'Ya, Kick Member Terlapor',
            cancelButtonText: 'Batal',
            icon: 'warning',
        }, () => {
            router.post(`/rooms/${room.code}/reports/${reportId}/kick`, {}, {
                preserveScroll: true,
            });
        });
    };

    const handleBuyPremium = () => {
        if (!canUseWallet) {
            showErrorAlert('Hanya Owner Room dan Bendahara yang memiliki wewenang untuk menggunakan saldo kas digital room.', 'Akses Terbatas');
            return;
        }

        const price = room.premium_price || 2000;

        showConfirmDialog(
            {
                title: 'Beli Fitur Premium Pass?',
                text: `Apakah Anda yakin ingin meng-upgrade room ini ke Paket Premium Pass seharga Rp ${price.toLocaleString('id-ID')}? Saldo Dompet Digital Room (Rp ${room.wallet_balance.toLocaleString('id-ID')}) akan dipotong otomatis.`,
                confirmButtonText: 'Ya, Beli Premium Pass',
                cancelButtonText: 'Batal',
                icon: 'question',
            },
            () => {
                setIsBuyingPremium(true);
                router.post(`/rooms/${room.code}/buy-premium`, {}, {
                    onFinish: () => {
                        setIsBuyingPremium(false);
                        setShowPremiumModal(false);
                    },
                });
            }
        );
    };

    // Form Inertia untuk Kirim Pesan & File Chat
    const chatForm = useForm({
        message: '',
        file: null as File | null,
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatForm.data.message.trim() && !chatForm.data.file) return;

        chatForm.post(`/rooms/${room.code}/messages`, {
            preserveScroll: true,
            onSuccess: () => {
                chatForm.reset();
            },
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (userFileCount >= maxFiles) {
                setShowPremiumModal(true);
                e.target.value = '';
                return;
            }

            // Validate allowed file extensions (e.g. forbid .apk, .dmg, .exe, etc.)
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar', '7z', 'tar', 'gz'];
            const fileNameParts = selected.name.split('.');
            const ext = fileNameParts.length > 1 ? (fileNameParts.pop()?.toLowerCase() || '') : '';

            if (!allowedExtensions.includes(ext)) {
                e.target.value = '';
                getSwalConfig().fire({
                    icon: 'warning',
                    title: 'Format File Tidak Sesuai Kriteria!',
                    html: `
                        <div style="text-align: left; font-size: 13px; line-height: 1.6;">
                            <p style="margin-bottom: 10px;">File <strong>"${selected.name}"</strong> (format <code>.${ext.toUpperCase() || 'UNKNOWN'}</code>) tidak dapat diunggah secara langsung.</p>
                            <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                                <strong style="color: #d97706; display: block; margin-bottom: 4px;">📌 Petunjuk & Solusi:</strong>
                                Silakan ubah atau kompres file tersebut ke dalam format <strong>.ZIP</strong> atau <strong>.RAR</strong> terlebih dahulu, atau kirimkan berkas foto/dokumen lain yang sesuai kriteria.
                            </div>
                            <p style="font-size: 11px; color: #71717a; margin: 0;">
                                <strong>Format Diizinkan:</strong> Gambar (.png, .jpg, .svg), Dokumen (.pdf, .docx, .xlsx, .txt), Arsip (.zip, .rar, .7z).
                            </p>
                        </div>
                    `,
                    confirmButtonText: 'Mengerti & Ubah File',
                    confirmButtonColor: '#f59e0b',
                });
                return;
            }

            chatForm.setData('file', selected);
        }
    };

    const handleClearSelectedFile = () => {
        chatForm.setData('file', null);
    };

    const formatFileSize = (bytes?: number | null) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

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
                                <span className="px-2 py-0.5 rounded bg-[#008080]/10 text-[#008080] dark:text-[#008080] border border-[#008080]/20 text-xs font-semibold flex items-center gap-1" title="Room Public: Akses langsung dengan kode">
                                    <Globe className="w-3 h-3 text-[#008080]" /> Public Room
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
                            <span>{room.name}</span>
                            {room.is_premium && (
                                <span className="px-2.5 py-1 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 inline-flex items-center gap-1.5 animate-pulse">
                                    <Crown className="w-4 h-4 fill-zinc-950" /> PREMIUM ROOM
                                </span>
                            )}
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

                        {/* Tombol Perpanjang Durasi Room */}
                        <button
                            onClick={() => {
                                if (extensionPackages && extensionPackages.length > 0) {
                                    setSelectedExtensionId(extensionPackages[0].id);
                                }
                                setShowExtendModal(true);
                            }}
                            className="px-3.5 py-2.5 bg-linear-to-r from-amber-500/10 to-orange-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                            title="Perpanjang durasi waktu room menggunakan Saldo Dompet Kas Digital"
                        >
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Perpanjang Waktu</span>
                        </button>

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
                            className="px-3.5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                            title="Top Up Saldo Kas Dompet via Midtrans"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>Top Up Kas</span>
                        </button>

                        {/* Tombol Bayar Pihak Ke-3 via Kas Digital (QRIS / VA / E-Wallet) */}
                        <button
                            onClick={handleOpenPaymentModal}
                            className="px-3.5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-teal-900/20"
                            title="Bayar ke Pihak Ke-3 (Merchant QRIS, Transfer Bank, VA) menggunakan Saldo Kas Digital"
                        >
                            <QrCode className="w-4 h-4 text-teal-200" />
                            <span>Bayar via Kas</span>
                        </button>

                        {/* Tombol Riwayat Pengeluaran Kas */}
                        <button
                            onClick={() => setShowPaymentHistoryModal(true)}
                            className="px-3 py-2.5 bg-background dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border dark:border-zinc-800 text-foreground dark:text-zinc-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            title="Lihat Riwayat Pembayaran & Struk Kas Digital"
                        >
                            <Receipt className="w-4 h-4 text-[#008080]" />
                            <span>Riwayat Bayar ({walletPayments.length})</span>
                        </button>

                        {/* Tombol Bagikan Kode Unik */}
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="px-4 py-2.5 bg-[#008080] hover:bg-[#008080]/90 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-[#008080]/20"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Bagikan Kode</span>
                        </button>

                        {/* Tombol Panel Laporan Member (Owner & Admin Only) */}
                        {isOwnerOrAdmin && (
                            <button
                                onClick={() => setShowOwnerReportsModal(true)}
                                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border relative ${
                                    reports.length > 0
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 shadow-sm'
                                        : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                                }`}
                                title="Panel Laporan Member Room"
                            >
                                <Flag className={`w-4 h-4 ${reports.length > 0 ? 'text-rose-500 animate-pulse' : 'text-zinc-400'}`} />
                                <span>Laporan Member</span>
                                {reports.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                                        {reports.length}
                                    </span>
                                )}
                            </button>
                        )}

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

                                        <div className="flex items-center gap-1.5 shrink-0">
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
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors shrink-0"
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
                                            : 'bg-[#008080]/10 border-[#008080]/30 text-[#008080] dark:text-[#008080]'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-xl mt-0.5 ${
                                            isAddFunds
                                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                : isUnfreeze
                                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                : 'bg-[#008080]/20 text-[#008080] dark:text-[#008080]'
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
                                        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
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
                                <div className="bg-background dark:bg-zinc-950 border border-[#008080]/30 p-5 rounded-2xl space-y-4 text-center">
                                    <div className="inline-flex p-3 rounded-full bg-[#008080]/10 text-[#008080] dark:text-[#008080]">
                                        <Sparkles className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-foreground dark:text-white text-sm">Simulasi Midtrans Payment Sandbox</h4>
                                        <p className="text-xs text-muted-foreground">Order ID: <span className="font-mono text-[#008080] font-semibold">{simulatorOrderId}</span></p>
                                        
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
                                                <Ticket className="w-3.5 h-3.5 text-[#008080]" /> Punya Kode Promo? <span className="text-[10px] text-muted-foreground font-normal">(Opsional)</span>
                                            </span>
                                            <span className="text-[10px] text-[#008080] font-semibold">Coba: HEMAT50 / DISKON5K</span>
                                        </label>

                                        {appliedPromo ? (
                                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
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
                                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-3.5 pr-3 py-2 text-xs text-foreground dark:text-white font-mono uppercase font-semibold focus:outline-none focus:border-[#008080]"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleApplyPromo}
                                                    disabled={isVerifyingPromo || !promoInput.trim()}
                                                    className="px-3.5 py-2 bg-[#008080] hover:bg-[#008080]/90 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
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
                                            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
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
                    <div className="bg-card dark:bg-zinc-900 border border-[#008080]/30 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                            <h3 className="font-bold text-foreground dark:text-white text-sm flex items-center gap-2">
                                <Share2 className="w-4 h-4 text-[#008080] dark:text-[#008080]" /> Bagikan Kode Unik Room
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
                                <span className="text-xs font-mono text-[#008080] dark:text-[#008080] flex items-center justify-between pt-1">
                                    {copiedLink ? 'Link Tersalin!' : 'Salin URL Direct'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Grid: Left Chat Feed & Right Members Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: LIVE GROUP CHAT FEED */}
                    <div className="lg:col-span-8 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between min-h-135 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#008080] dark:text-[#008080]" />
                                <h2 className="font-bold text-foreground dark:text-white text-sm">Obrolan Room ({messages.length})</h2>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Real-Time
                                </span>
                            </div>
                            
                            {/* File Limit Indicator & Upgrade Badge */}
                            {room.is_premium ? (
                                <button
                                    type="button"
                                    onClick={() => setShowPremiumModal(true)}
                                    className="px-2.5 py-1 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 bg-linear-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:from-amber-500/20 hover:to-orange-500/20 shadow-sm"
                                    title="Fitur Premium Pass Aktif! Klik untuk rincian invoice"
                                >
                                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                                    <span>File: <strong className="text-amber-500 font-bold">Unlimited ♾️</strong></span>
                                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded text-[9px] font-sans font-bold">Pro</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowPremiumModal(true)}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 ${
                                        userFileCount >= maxFiles
                                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 shadow-sm'
                                            : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                                    }`}
                                    title="Batas 20 File gabungan per room (Seluruh Member). Klik untuk info Premium"
                                >
                                    <Paperclip className="w-3.5 h-3.5 text-[#008080]" />
                                    <span>File: <strong className={userFileCount >= maxFiles ? 'text-rose-500 font-bold' : 'text-emerald-500'}>{userFileCount}/{maxFiles}</strong></span>
                                    {userFileCount >= maxFiles && (
                                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded text-[9px] font-sans font-bold flex items-center gap-0.5">
                                            <Lock className="w-2.5 h-2.5" /> Terkunci
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Chat Messages Feed Container */}
                        <div ref={chatContainerRef} className="space-y-4 overflow-y-auto max-h-100 pr-2 py-2">
                            {/* PINNED MESSAGES HEADER BANNER */}
                            {pinnedMessages && pinnedMessages.length > 0 && (
                                <div className="sticky top-0 z-10 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2 text-xs shadow-sm mb-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                                        <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" /> Pesan Disematkan oleh Owner ({pinnedMessages.length}/2)
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono">Klik pesan untuk lompat</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {pinnedMessages.map((pm) => (
                                            <div
                                                key={pm.id}
                                                onClick={() => handleScrollToMessage(pm.id)}
                                                className="p-2 bg-background dark:bg-zinc-950 border border-amber-500/20 hover:border-amber-500/50 rounded-lg cursor-pointer transition-all flex items-start justify-between gap-2 group shadow-xs"
                                            >
                                                <div className="min-w-0 space-y-0.5">
                                                    <span className="font-bold text-foreground dark:text-white text-[11px] flex items-center gap-1">
                                                        <span>{pm.user_name}</span>
                                                        <span className="text-[9px] text-muted-foreground font-mono">({pm.time})</span>
                                                    </span>
                                                    <p className="text-[11px] text-muted-foreground truncate group-hover:text-foreground">
                                                        {pm.message || (pm.file_name ? `📎 File: ${pm.file_name}` : '')}
                                                    </p>
                                                </div>

                                                {isOwnerOrAdmin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTogglePinMessage(pm.id, true);
                                                        }}
                                                        className="p-1 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 shrink-0"
                                                        title="Lepas Sematan Pesan Ini"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, index) => {
                                const isSelf = msg.user_id === currentUser?.id;
                                const isOwner = msg.role_in_room === 'owner';
                                const isBendahara = msg.role_in_room === 'bendahara';

                                const isFirstUnread = lastReadMessageId
                                    ? msg.id > lastReadMessageId && (index === 0 || messages[index - 1].id <= lastReadMessageId)
                                    : false;

                                return (
                                    <Fragment key={msg.id}>
                                        {isFirstUnread && (
                                            <div id="unread-divider" className="my-4 flex items-center gap-3">
                                                <div className="h-px flex-1 bg-amber-500/30 dark:bg-amber-500/20" />
                                                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                    <Bell className="w-3 h-3 text-amber-500 animate-bounce" /> Pesan Belum Dibaca
                                                </span>
                                                <div className="h-px flex-1 bg-amber-500/30 dark:bg-amber-500/20" />
                                            </div>
                                        )}

                                        <div
                                            id={`msg-${msg.id}`}
                                            className={`flex items-start gap-2.5 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* User Initial Avatar */}
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-sm ${
                                                    isSelf
                                                        ? 'bg-[#008080]'
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
                                                className={`max-w-[78%] rounded-2xl p-3.5 text-xs border space-y-1 shadow-sm transition-all ${
                                                    msg.is_pinned
                                                        ? 'bg-amber-500/10 dark:bg-amber-950/40 text-foreground dark:text-zinc-200 border-amber-500/60 ring-1 ring-amber-500/30'
                                                        : isSelf
                                                        ? 'bg-[#008080] text-white rounded-tr-none border-[#008080]'
                                                        : 'bg-background dark:bg-zinc-950 text-foreground dark:text-zinc-200 rounded-tl-none border-border dark:border-zinc-800'
                                                }`}
                                            >
                                                {/* Sender Header Name & Role Badge */}
                                                <div className="flex items-center gap-2 justify-between border-b border-white/10 dark:border-white/10 pb-1 mb-1">
                                                    <span className="font-bold text-[11px] flex items-center gap-1.5 flex-wrap">
                                                        <span>{msg.user_name}</span>
                                                        {msg.is_pinned && (
                                                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[9px] font-bold border border-amber-500/40 inline-flex items-center gap-0.5">
                                                                <Pin className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> Disematkan
                                                            </span>
                                                        )}
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

                                                    <div className="flex items-center gap-1.5">
                                                        {isOwnerOrAdmin && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTogglePinMessage(msg.id, msg.is_pinned)}
                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all flex items-center gap-0.5 ${
                                                                    msg.is_pinned
                                                                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                                                                        : 'bg-black/10 dark:bg-white/10 hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500'
                                                                }`}
                                                                title={msg.is_pinned ? 'Lepas Sematan Pesan' : 'Sematkan Pesan di Atas Obrolan (Maks 2)'}
                                                            >
                                                                <Pin className={`w-2.5 h-2.5 ${msg.is_pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                                                                <span>{msg.is_pinned ? 'Lepas Sematan' : 'Sematkan'}</span>
                                                            </button>
                                                        )}
                                                        <span className={`text-[9px] font-mono ${isSelf && !msg.is_pinned ? 'text-teal-100' : 'text-muted-foreground'}`}>{msg.time}</span>
                                                    </div>
                                                </div>

                                                {/* Message Text */}
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                                                {/* File Attachment Render */}
                                                {msg.file_path && (
                                                    <div className={`mt-2 p-2.5 rounded-xl border text-xs ${
                                                        isSelf ? 'bg-[#006666]/60 border-[#008080]/30 text-white' : 'bg-card dark:bg-zinc-900 border-border dark:border-zinc-800 text-foreground dark:text-zinc-200'
                                                    }`}>
                                                        {msg.file_type === 'image' ? (
                                                            <div className="space-y-2">
                                                                <img src={msg.file_path} alt={msg.file_name || 'Gambar'} className="max-h-48 rounded-lg object-cover w-full border border-black/10 dark:border-white/10" />
                                                                <div className="flex items-center justify-between gap-2 text-[10px]">
                                                                    <span className="truncate max-w-37.5 font-mono">{msg.file_name}</span>
                                                                    <a href={msg.file_path} target="_blank" rel="noopener noreferrer" download className="px-2 py-1 rounded bg-black/20 hover:bg-black/40 text-white flex items-center gap-1 font-semibold">
                                                                        <Download className="w-3 h-3" /> Unduh
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    {msg.file_type === 'archive' ? (
                                                                        <FileArchive className="w-6 h-6 text-amber-400 shrink-0" />
                                                                    ) : msg.file_type === 'document' ? (
                                                                        <FileText className="w-6 h-6 text-[#008080] shrink-0" />
                                                                    ) : (
                                                                        <File className="w-6 h-6 text-emerald-400 shrink-0" />
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold truncate text-[11px]">{msg.file_name}</p>
                                                                        <p className="text-[9px] opacity-75 font-mono">{formatFileSize(msg.file_size)}</p>
                                                                    </div>
                                                                </div>
                                                                <a
                                                                    href={msg.file_path}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download
                                                                    className="px-2.5 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white font-semibold text-[10px] transition-colors flex items-center gap-1 shrink-0"
                                                                >
                                                                    <Download className="w-3 h-3" />
                                                                    <span>Unduh</span>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Fragment>
                                );
                            })}
                            <div ref={messagesEndRef} />

                            {messages.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground space-y-2">
                                    <MessageSquare className="w-8 h-8 mx-auto opacity-50" />
                                    <p className="text-xs">Belum ada pesan di room ini. Mulai percakapan pertama!</p>
                                </div>
                            )}
                        </div>

                        {/* Send Message & File Attachment Form Bar */}
                        <div className="pt-3 border-t border-border dark:border-zinc-800 space-y-2">
                            {/* Selected File Preview Banner */}
                            {chatForm.data.file && (
                                <div className="p-2.5 bg-[#008080]/10 border border-[#008080]/30 rounded-xl flex items-center justify-between gap-2 text-xs text-[#008080] dark:text-[#008080]">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Paperclip className="w-4 h-4 text-[#008080] shrink-0" />
                                        <span className="font-bold font-mono truncate">{chatForm.data.file.name}</span>
                                        <span className="text-[10px] opacity-75 font-mono">({formatFileSize(chatForm.data.file.size)})</span>
                                    </div>
                                    <button type="button" onClick={handleClearSelectedFile} className="p-1 rounded hover:bg-[#008080]/20 text-rose-500">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                {/* Hidden File Input */}
                                <input
                                    id="chat-file-input"
                                    type="file"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="*/*"
                                    disabled={!room.is_premium && userFileCount >= maxFiles}
                                />

                                {/* Attach File Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!room.is_premium && userFileCount >= maxFiles) {
                                            setShowPremiumModal(true);
                                        } else {
                                            document.getElementById('chat-file-input')?.click();
                                        }
                                    }}
                                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                                        !room.is_premium && userFileCount >= maxFiles
                                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                                            : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 text-muted-foreground hover:text-foreground hover:border-[#008080]'
                                    }`}
                                    title={!room.is_premium && userFileCount >= maxFiles ? 'Batas total 20 file room tercapai! Klik untuk upgrade Premium' : 'Unggah dokumen, foto, atau ZIP (Maks 20 file gabungan room)'}
                                >
                                    {!room.is_premium && userFileCount >= maxFiles ? (
                                        <Lock className="w-4 h-4 text-rose-500" />
                                    ) : (
                                        <Paperclip className="w-4 h-4" />
                                    )}
                                </button>

                                <input
                                    type="text"
                                    value={chatForm.data.message}
                                    onChange={e => chatForm.setData('message', e.target.value)}
                                    placeholder={!room.is_premium && userFileCount >= maxFiles ? "Ketik pesan kamu (Upload file terkunci)..." : "Ketik pesan kamu atau lampirkan file..."}
                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground dark:text-white focus:outline-none focus:border-[#008080]"
                                />

                                <button
                                    type="submit"
                                    disabled={chatForm.processing || (!chatForm.data.message.trim() && !chatForm.data.file)}
                                    className="px-4 py-2.5 rounded-xl bg-[#008080] hover:bg-[#008080]/90 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-[#008080]/20 shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Kirim</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DAFTAR ANGGOTA / MEMBER ROOM & BENDAHARA MANAGEMENT & KICK */}
                    <div className="lg:col-span-4 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#008080] dark:text-[#008080]" />
                                <h3 className="font-bold text-foreground dark:text-white text-sm">Anggota Room ({members.length})</h3>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Role</span>
                        </div>

                        {/* Members List */}
                        <div className="space-y-3 max-h-110 overflow-y-auto pr-1">
                            {members.map((m) => {
                                const isOwner = m.role_in_room === 'owner';
                                const isBendahara = m.role_in_room === 'bendahara';

                                return (
                                    <div key={m.id} className="bg-background dark:bg-zinc-950 p-3 rounded-xl border border-border dark:border-zinc-800 space-y-2.5 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                                                    isOwner ? 'bg-amber-600' : isBendahara ? 'bg-emerald-600' : 'bg-[#008080]'
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

                                        {/* Actions: Report Member or Owner Controls */}
                                        <div className="pt-2 border-t border-border dark:border-zinc-900 flex items-center justify-end gap-2 flex-wrap">
                                            {/* Report Button for all members (except reporting oneself) */}
                                            {m.user_id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleOpenReportModal(m.user_id, m.name)}
                                                    className="px-2 py-1 rounded text-[10px] font-semibold bg-zinc-500/10 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border dark:border-zinc-800 hover:border-rose-500/30 transition-colors flex items-center gap-1"
                                                    title="Laporkan member ini ke Owner room"
                                                >
                                                    <Flag className="w-3 h-3 text-rose-400" />
                                                    <span>Laporkan</span>
                                                </button>
                                            )}

                                            {/* Actions for Owner / Admin: Assign Bendahara or Kick Member */}
                                            {isOwnerOrAdmin && !isOwner && m.user_id !== currentUser?.id && (
                                                <>
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
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* PREMIUM UPGRADE & INVOICE MODAL */}
                {showPremiumModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-amber-500" />
                                    <h3 className="font-bold text-foreground dark:text-white text-base">ShareRoom Premium Pass</h3>
                                </div>
                                <button onClick={() => setShowPremiumModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {room.is_premium ? (
                                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 text-emerald-700 dark:text-emerald-300">
                                        <span className="text-xs font-bold flex items-center gap-1.5">
                                            <Crown className="w-4 h-4 text-amber-500" /> FITUR PREMIUM PASS AKTIF (PRO ROOM)
                                        </span>
                                        <p className="text-[11px] text-muted-foreground">
                                            Seluruh member di room ini kini menikmati pengiriman berkas/file tanpa batas (Unlimited File Uploads).
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                                            Upgrade Ke Paket Premium Pass Room
                                        </span>
                                        <p className="text-[11px] text-muted-foreground">
                                            Beli fitur Premium Pass untuk membuka akses unggah file tanpa batas untuk <strong>SELURUH MEMBER</strong> di room ini!
                                        </p>
                                    </div>
                                )}

                                {/* Benefits List */}
                                <div className="space-y-2.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Keuntungan Akun Premium:</h4>
                                    <ul className="space-y-2 text-xs">
                                        <li className="flex items-center gap-2 text-foreground dark:text-zinc-200 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span>Upload File Tanpa Batas (Berlaku untuk Semua Member)</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-foreground dark:text-zinc-200 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span>Badge Mahkota Premium Mahkota di Header Room</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-foreground dark:text-zinc-200 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span>Batas Ukuran File Hingga 25 MB per File</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-foreground dark:text-zinc-200 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span>Penyimpanan Aman & Invoice Pembelian Kas Resmi</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Price & Wallet Calculation Card */}
                                <div className="bg-background dark:bg-zinc-950 p-4 rounded-xl border border-border dark:border-zinc-800 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Durasi Room:</span>
                                        <span className="font-semibold text-foreground dark:text-white">{room.duration_hours} Jam</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Saldo Dompet Kas Room:</span>
                                        <span className={`font-mono font-bold ${room.wallet_balance >= (room.premium_price || 2000) ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            Rp {room.wallet_balance.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-border dark:border-zinc-900 flex items-center justify-between font-bold">
                                        <span className="text-xs text-foreground dark:text-white">Harga Premium Pass:</span>
                                        <span className="text-lg font-mono text-amber-500">
                                            Rp {(room.premium_price || 2000).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground block text-right font-mono">
                                        (Rp 2.000 base + {Math.max(0, room.duration_hours - 1)} jam × Rp 500)
                                    </span>
                                </div>

                                {/* Wallet Balance Status Message */}
                                {!room.is_premium && (
                                    !canUseWallet ? (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400 space-y-1">
                                            <span className="font-bold flex items-center gap-1.5">
                                                <Shield className="w-4 h-4 text-amber-500" /> Wewenang Kas Terbatas
                                            </span>
                                            <p className="text-[11px] text-muted-foreground">
                                                Penggunaan & pemotongan saldo kas digital room hanya dapat dilakukan oleh <strong>Owner Room</strong> atau <strong>Bendahara</strong>. Anda tetap dapat melakukan Top Up untuk mengisi saldo kas room ini.
                                            </p>
                                        </div>
                                    ) : room.wallet_balance < (room.premium_price || 2000) ? (
                                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 space-y-1">
                                            <span className="font-bold flex items-center gap-1">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Saldo Dompet Kas Tidak Cukup
                                            </span>
                                            <p className="text-[11px] text-muted-foreground">
                                                Butuh Rp {((room.premium_price || 2000) - room.wallet_balance).toLocaleString('id-ID')} lagi di Saldo Kas Room. Silakan lakukan Top Up Saldo Kas terlebih dahulu.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400">
                                            <span className="font-bold flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Saldo Kas Siap Digunakan
                                            </span>
                                            <p className="text-[11px] text-muted-foreground">
                                                Pembelian Premium akan memotong Saldo Kas Room sebesar Rp {(room.premium_price || 2000).toLocaleString('id-ID')}.
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex flex-col gap-2 pt-1">
                                {room.is_premium ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (invoices && invoices.length > 0) {
                                                setSelectedInvoice(invoices[0]);
                                                setShowInvoiceModal(true);
                                            } else {
                                                showInfoAlert('Room ini sudah aktif Paket Premium Pass!', 'Premium Active');
                                            }
                                        }}
                                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Lihat Bukti Invoice Pembelian</span>
                                    </button>
                                ) : !canUseWallet ? (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPremiumModal(false);
                                                setShowTopUpModal(true);
                                            }}
                                            className="w-full py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            <span>Isi / Top Up Saldo Digital Room</span>
                                        </button>
                                        <p className="text-[10px] text-center text-muted-foreground font-medium">
                                            * Hanya Owner Room & Bendahara yang memiliki akses menggunakan saldo kas untuk beli Premium.
                                        </p>
                                    </div>
                                ) : room.wallet_balance < (room.premium_price || 2000) ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPremiumModal(false);
                                            setShowTopUpModal(true);
                                        }}
                                        className="w-full py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Top Up Saldo Digital Room Sekarang</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={isBuyingPremium}
                                        onClick={handleBuyPremium}
                                        className="w-full py-2.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                    >
                                        <Crown className="w-4 h-4" />
                                        <span>{isBuyingPremium ? 'Memproses Pembelian...' : `Beli Premium Pass (Rp ${(room.premium_price || 2000).toLocaleString('id-ID')})`}</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowPremiumModal(false)}
                                    className="w-full py-2 text-xs text-muted-foreground hover:text-foreground font-semibold"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* INVOICE RESMI MODAL */}
                {showInvoiceModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-500" />
                                    <h3 className="font-bold text-foreground dark:text-white text-base">Invoice Resmi Premium Pass</h3>
                                </div>
                                <button onClick={() => setShowInvoiceModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {selectedInvoice || (invoices && invoices.length > 0) ? (
                                <div className="space-y-4 text-xs">
                                    {(() => {
                                        const inv = selectedInvoice || invoices[0];
                                        return (
                                            <div className="bg-background dark:bg-zinc-950 p-4 rounded-xl border border-border dark:border-zinc-800 space-y-3">
                                                <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-2">
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground block uppercase font-bold">No. Invoice</span>
                                                        <span className="font-mono font-bold text-[#008080] text-sm">{inv.invoice_number}</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">LUNAS / PAID</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                                    <div>
                                                        <span className="text-muted-foreground block text-[9px]">Pembeli / Member</span>
                                                        <span className="font-semibold text-foreground dark:text-white">{inv.user_name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[9px]">Waktu Transaksi</span>
                                                        <span className="font-mono text-foreground dark:text-white">{inv.paid_at}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[9px]">Layanan</span>
                                                        <span className="font-semibold text-amber-500">{inv.feature_name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[9px]">Sumber Pembayaran</span>
                                                        <span className="font-semibold text-emerald-500">Saldo Dompet Kas Room</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-border dark:border-zinc-800 flex items-center justify-between font-bold text-sm">
                                                    <span>Total Potongan Kas</span>
                                                    <span className="font-mono text-emerald-500">Rp {inv.amount.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-4">Tidak ada data invoice.</p>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowInvoiceModal(false)}
                                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-xs transition-colors"
                            >
                                Tutup Invoice
                            </button>
                        </div>
                    </div>
                )}

                {/* MODAL LAPORKAN MEMBER (USER MEMBER SIDE) */}
                {showReportModal && selectedReportMember && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Flag className="w-5 h-5 text-rose-500" />
                                    <h3 className="font-bold text-foreground dark:text-white text-base">Laporkan Member Room</h3>
                                </div>
                                <button onClick={() => setShowReportModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitReport} className="space-y-4">
                                <div className="p-3 bg-background dark:bg-zinc-950 rounded-xl border border-border dark:border-zinc-800 space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Member Yang Dilaporkan:</span>
                                    <span className="font-bold text-foreground dark:text-white text-sm flex items-center gap-1.5">
                                        <UserIcon className="w-4 h-4 text-rose-500" /> {selectedReportMember.name}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                        Kategori Pelanggaran / Alasan:
                                    </label>
                                    <select
                                        value={reportForm.data.reason_category}
                                        onChange={(e) => reportForm.setData('reason_category', e.target.value)}
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-foreground dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                                    >
                                        <option value="Perilaku Tidak Menyenangkan">Perilaku Tidak Menyenangkan / Mengganggu</option>
                                        <option value="Pesan Spam / Promosi">Pesan Spam / Promosi Tidak Izin</option>
                                        <option value="Bahasa Kasar / SARA">Bahasa Kasar / Keras / SARA</option>
                                        <option value="Pencegatan / Penipuan">Percobaan Penipuan / Pengancaman</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                        Rincian Deskripsi Laporan (Opsional):
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={reportForm.data.description}
                                        onChange={(e) => reportForm.setData('description', e.target.value)}
                                        placeholder="Jelaskan tindakan member tersebut yang dinilai melanggar aturan room..."
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl p-3 text-xs text-foreground dark:text-white focus:outline-none focus:border-rose-500"
                                    />
                                    <span className="text-[10px] text-muted-foreground block">
                                        * Laporan ini akan langsung diteruskan ke halaman khusus Owner Room secara rahasia.
                                    </span>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-border dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowReportModal(false)}
                                        className="px-4 py-2.5 rounded-xl border border-border dark:border-zinc-800 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={reportForm.processing}
                                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                                    >
                                        <Flag className="w-4 h-4" />
                                        <span>{reportForm.processing ? 'Mengirim...' : 'Kirim Laporan ke Owner'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL PANEL LAPORAN MEMBER (KHUSUS OWNER ROOM & ADMIN) */}
                {showOwnerReportsModal && isOwnerOrAdmin && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-rose-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-rose-500" />
                                    <div>
                                        <h3 className="font-bold text-foreground dark:text-white text-base">Panel Laporan Member Room</h3>
                                        <p className="text-[11px] text-muted-foreground">Hanya dapat diakses oleh Owner Room & Administrator</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowOwnerReportsModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {reports && reports.length > 0 ? (
                                <div className="space-y-3 max-h-105 overflow-y-auto pr-1">
                                    {reports.map((rep) => (
                                        <div key={rep.id} className="bg-background dark:bg-zinc-950 p-4 rounded-xl border border-rose-500/20 space-y-3 shadow-sm text-xs">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1 w-full">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                                            🚩 {rep.reason_category}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">• {rep.created_at}</span>
                                                    </div>
                                                    
                                                    <div className="pt-1 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Pelapor (Yang Melaporkan):</span>
                                                            <span className="font-semibold text-foreground dark:text-white flex items-center gap-1">
                                                                <UserIcon className="w-3.5 h-3.5 text-[#008080]" /> {rep.reporter_name}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Terlapor (Yang Dilaporkan):</span>
                                                            <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                                <UserMinus className="w-3.5 h-3.5 text-rose-500" /> {rep.reported_name}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {rep.description && (
                                                        <div className="mt-2 p-2.5 bg-card dark:bg-zinc-900 rounded-lg border border-border dark:border-zinc-800 text-muted-foreground italic">
                                                            "{rep.description}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Owner Choices Actions */}
                                            <div className="pt-2 border-t border-border dark:border-zinc-800 flex items-center justify-end gap-2 flex-wrap">
                                                {/* Option 1: Abaikan & Pertahankan Member */}
                                                <button
                                                    onClick={() => handleDismissReport(rep.id, rep.reported_name)}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold transition-colors flex items-center gap-1"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Abaikan & Pertahankan Member</span>
                                                </button>

                                                {/* Option 2: Kick Member Terlapor */}
                                                <button
                                                    onClick={() => handleKickReportedMember(rep.id, rep.reported_name)}
                                                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm transition-colors flex items-center gap-1"
                                                >
                                                    <UserMinus className="w-3.5 h-3.5" />
                                                    <span>Kick Member Terlapor</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground space-y-2">
                                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-60" />
                                    <p className="text-xs font-semibold text-foreground dark:text-white">Tidak ada laporan member yang belum diproses!</p>
                                    <p className="text-[11px]">Seluruh laporan member telah selesai ditindaklanjuti.</p>
                                </div>
                            )}

                            <div className="flex justify-end pt-2 border-t border-border dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowOwnerReportsModal(false)}
                                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs"
                                >
                                    Tutup Panel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* MODAL PERPANJANG DURASI ROOM VIA SALDO KAS DIGITAL */}
                {showExtendModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <div>
                                    <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-amber-500" /> Perpanjang Durasi Room
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">Tambah masa aktif room menggunakan Saldo Dompet Kas Digital</p>
                                </div>
                                <button onClick={() => setShowExtendModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Current Expiration Card */}
                                <div className="bg-background dark:bg-zinc-950 p-3.5 rounded-xl border border-border dark:border-zinc-800 space-y-1 text-xs">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Berlaku Hingga saat ini:</span>
                                        <span className="font-mono font-bold text-amber-500">
                                            {new Date(room.expires_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border dark:border-zinc-900">
                                        <span>Saldo Kas Room Tersedia:</span>
                                        <span className="font-mono font-bold text-emerald-500">
                                            Rp {room.wallet_balance.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                {/* Restricted Notice if Regular Member */}
                                {!canUseWallet && (
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400 space-y-1">
                                        <span className="font-bold flex items-center gap-1.5">
                                            <Shield className="w-4 h-4 text-amber-500" /> Wewenang Kas Terbatas
                                        </span>
                                        <p className="text-[11px] text-muted-foreground">
                                            Penggunaan saldo kas digital untuk perpanjangan durasi room hanya dapat dilakukan oleh <strong>Owner Room</strong> atau <strong>Bendahara</strong>. Anda tetap dapat melakukan Top Up untuk membantu mengisi saldo kas room.
                                        </p>
                                    </div>
                                )}

                                {/* Extension Packages List */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                        Pilih Paket Perpanjangan Durasi (Jam):
                                    </label>

                                    {extensionPackages.length === 0 ? (
                                        <div className="p-4 bg-muted/30 border border-border dark:border-zinc-800 rounded-xl text-center text-xs text-muted-foreground">
                                            Maaf, opsi paket perpanjangan durasi room saat ini sedang tidak disediakan oleh Admin.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2.5 max-h-55 overflow-y-auto pr-1">
                                            {extensionPackages.map((pkg) => {
                                                const isSelected = selectedExtensionId === pkg.id;
                                                const isAffordable = room.wallet_balance >= pkg.price;

                                                return (
                                                    <button
                                                        key={pkg.id}
                                                        type="button"
                                                        onClick={() => setSelectedExtensionId(pkg.id)}
                                                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                                                            isSelected
                                                                ? 'bg-amber-500/10 border-amber-500 text-foreground ring-2 ring-amber-500/40 shadow-sm'
                                                                : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 hover:border-amber-500/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                                                isSelected ? 'bg-amber-500 text-zinc-950' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                                +{pkg.hours}h
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-xs text-foreground dark:text-white block">
                                                                    Tambah +{pkg.hours} Jam
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                                    ({(pkg.hours / 24).toFixed(1)} hari tambahan)
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <span className="font-mono font-bold text-sm text-amber-500 block">
                                                                Rp {pkg.price.toLocaleString('id-ID')}
                                                            </span>
                                                            {!isAffordable && (
                                                                <span className="text-[9px] font-bold text-rose-500 block">
                                                                    Saldo Kas Kurang
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-1">
                                {extensionPackages.length > 0 && (
                                    !canUseWallet ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowExtendModal(false);
                                                setShowTopUpModal(true);
                                            }}
                                            className="w-full py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            <span>Isi / Top Up Saldo Digital Room</span>
                                        </button>
                                    ) : (() => {
                                        const selectedPkg = extensionPackages.find(p => p.id === selectedExtensionId);
                                        const isAffordable = selectedPkg ? room.wallet_balance >= selectedPkg.price : false;

                                        if (!isAffordable) {
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowExtendModal(false);
                                                        setShowTopUpModal(true);
                                                    }}
                                                    className="w-full py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                    <span>Saldo Kas Kurang (Top Up Sekarang)</span>
                                                </button>
                                            );
                                        }

                                        return (
                                            <button
                                                type="button"
                                                disabled={isExtendingDuration || !selectedExtensionId}
                                                onClick={handleExtendDurationSubmit}
                                                className="w-full py-2.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {isExtendingDuration
                                                        ? 'Memproses Perpanjangan...'
                                                        : `Perpanjang +${selectedPkg?.hours || 0} Jam Sekarang (Rp ${selectedPkg?.price.toLocaleString('id-ID') || 0})`}
                                                </span>
                                            </button>
                                        );
                                    })()
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowExtendModal(false)}
                                    className="w-full py-2 text-xs text-muted-foreground hover:text-foreground font-semibold"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: PEMBAYARAN KAS DIGITAL (DISBURSEMENT TO THIRD PARTY) */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3">
                                <div>
                                    <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                        <QrCode className="w-5 h-5 text-[#008080]" /> Pembayaran via Kas Digital
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">Bayar merchant QRIS, Virtual Account, atau Transfer Bank menggunakan Saldo Kas Room.</p>
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Tab Selection */}
                            <div className="flex items-center gap-1.5 p-1 bg-background dark:bg-zinc-950 rounded-xl border border-border dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentTab('qris');
                                        setPaymentMethod('qris');
                                    }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        paymentTab === 'qris'
                                            ? 'bg-[#008080] text-white shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <ScanLine className="w-3.5 h-3.5" /> Scan QRIS
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentTab('invoice');
                                        setPaymentMethod('virtual_account');
                                        setPaymentBankName('Midtrans Payment Link');
                                    }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        paymentTab === 'invoice'
                                            ? 'bg-[#008080] text-white shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <FileText className="w-3.5 h-3.5" /> Invoice / Link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentTab('va');
                                        setPaymentMethod('virtual_account');
                                    }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        paymentTab === 'va'
                                            ? 'bg-[#008080] text-white shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Building2 className="w-3.5 h-3.5" /> Bank / VA
                                </button>
                            </div>

                            <form onSubmit={handleExecutePaymentSubmit} className="space-y-4">
                                {paymentTab === 'qris' ? (
                                    <div className="space-y-4">
                                        {/* QRIS Scanner & Drag Drop Upload Zone */}
                                        <div className="border-2 border-dashed border-[#008080]/40 dark:border-[#008080]/30 rounded-2xl p-5 text-center bg-[#008080]/5 relative hover:bg-[#008080]/10 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleQrisFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                            />
                                            {qrisPreview ? (
                                                <div className="space-y-2">
                                                    <img src={qrisPreview} alt="Preview QRIS" className="max-h-40 mx-auto rounded-xl shadow-md border border-[#008080]/30" />
                                                    <p className="text-[11px] font-mono text-emerald-500 font-bold flex items-center justify-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Foto QRIS Berhasil Diunggah!
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 py-2">
                                                    <div className="w-12 h-12 mx-auto rounded-full bg-[#008080]/20 text-[#008080] flex items-center justify-center">
                                                        <UploadCloud className="w-6 h-6 animate-bounce" />
                                                    </div>
                                                    <p className="text-xs font-bold text-foreground dark:text-white">
                                                        Klik atau Tarik Foto Kode QRIS di sini
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Mendukung format PNG, JPG, JPEG. Sistem akan membaca nama merchant & nominal otomatis.
                                                    </p>
                                                </div>
                                            )}
                                            {isDetectingQris && (
                                                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-2 z-20">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Mendeteksi QRIS & Harga...
                                                </div>
                                            )}
                                        </div>

                                        {/* Detected Merchant & Account Details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                                    Nama Merchant QRIS / Penerima
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentRecipientName}
                                                    onChange={e => setPaymentRecipientName(e.target.value)}
                                                    placeholder="Contoh: Sewa Futsal Arena"
                                                    required
                                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground dark:text-white font-semibold focus:outline-none focus:border-[#008080]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                                    NMI / ID QRIS <span className="text-[10px] text-muted-foreground font-normal">(Opsional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentRecipientAccount}
                                                    onChange={e => setPaymentRecipientAccount(e.target.value)}
                                                    placeholder="ID1020304050607"
                                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground dark:text-white font-mono focus:outline-none focus:border-[#008080]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : paymentTab === 'invoice' ? (
                                    <div className="space-y-4">
                                        {/* Upload Invoice Screenshot / PDF Zone */}
                                        <div className="border-2 border-dashed border-[#008080]/40 dark:border-[#008080]/30 rounded-2xl p-4 text-center bg-[#008080]/5 relative hover:bg-[#008080]/10 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleInvoiceFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                            />
                                            {invoicePreview ? (
                                                <div className="space-y-2">
                                                    <img src={invoicePreview} alt="Preview Invoice" className="max-h-36 mx-auto rounded-xl shadow-md border border-[#008080]/30 object-contain" />
                                                    <p className="text-[11px] font-mono text-emerald-500 font-bold flex items-center justify-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Foto Invoice / Struk Midtrans Berhasil Diunggah!
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5 py-1">
                                                    <div className="w-10 h-10 mx-auto rounded-full bg-[#008080]/20 text-[#008080] flex items-center justify-center">
                                                        <UploadCloud className="w-5 h-5 animate-bounce" />
                                                    </div>
                                                    <p className="text-xs font-bold text-foreground dark:text-white">
                                                        Upload Screenshot Invoice Midtrans / Struk Nota
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Mendukung PNG, JPG, JPEG, PDF (misal Invoice #893d504e Midtrans). Sistem membaca harga otomatis.
                                                    </p>
                                                </div>
                                            )}
                                            {isDetectingInvoice && (
                                                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-2 z-20">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Mendeteksi Invoice & Total Tagihan...
                                                </div>
                                            )}
                                        </div>

                                        {/* Divider Atau Input Link / ID */}
                                        <div className="relative my-2">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-border dark:border-zinc-800" />
                                            </div>
                                            <div className="relative flex justify-center text-[10px] uppercase">
                                                <span className="bg-card dark:bg-zinc-900 px-2 text-muted-foreground font-bold">
                                                    Atau Input Link Payment / Invoice ID
                                                </span>
                                            </div>
                                        </div>

                                        {/* Input Payment Link / Invoice ID */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                                Nomor Invoice Midtrans / Payment Link URL
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={invoiceInputText}
                                                    onChange={e => setInvoiceInputText(e.target.value)}
                                                    placeholder="Contoh: 893d504e-1128-4fce-ba9c-bf592762bf9a"
                                                    className="flex-1 bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground dark:text-white font-mono focus:outline-none focus:border-[#008080]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleInvoiceInputDetect}
                                                    disabled={isDetectingInvoice}
                                                    className="px-3.5 py-2 bg-[#008080] hover:bg-[#008080]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    <span>Cek & Deteksi</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detected Merchant & Account Details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                                    Nama Merchant / Tagihan
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentRecipientName}
                                                    onChange={e => setPaymentRecipientName(e.target.value)}
                                                    placeholder="Contoh: Gacoan (Midtrans Invoice)"
                                                    required
                                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground dark:text-white font-semibold focus:outline-none focus:border-[#008080]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                                    Nomor Invoice / Order ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentRecipientAccount}
                                                    onChange={e => setPaymentRecipientAccount(e.target.value)}
                                                    placeholder="893d504e-1128-4fce-ba9c-bf592762bf9a"
                                                    required
                                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground dark:text-white font-mono focus:outline-none focus:border-[#008080]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Bank & E-Wallet Grid Selector */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                                Pilih Bank / E-Wallet Tujuan
                                            </label>
                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                                {['BCA', 'Mandiri', 'BNI', 'BRI', 'Permata', 'GoPay', 'DANA', 'OVO', 'ShopeePay'].map((b) => (
                                                    <button
                                                        key={b}
                                                        type="button"
                                                        onClick={() => {
                                                            setPaymentBankName(b);
                                                            setPaymentMethod(b.includes('Pay') || b === 'DANA' || b === 'OVO' ? 'ewallet' : 'virtual_account');
                                                        }}
                                                        className={`p-2 rounded-xl border text-xs font-bold font-mono transition-all text-center ${
                                                            paymentBankName === b
                                                                ? 'bg-[#008080] text-white border-[#008080] shadow-sm'
                                                                : 'bg-background dark:bg-zinc-950 border-border dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                                    Nama Rekening / Penerima
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentRecipientName}
                                                    onChange={e => setPaymentRecipientName(e.target.value)}
                                                    placeholder="Contoh: PT Lapangan Berkah"
                                                    required
                                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground dark:text-white font-semibold focus:outline-none focus:border-[#008080]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                                    Nomor VA / Rekening
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentRecipientAccount}
                                                    onChange={e => setPaymentRecipientAccount(e.target.value)}
                                                    placeholder="880123456789"
                                                    required
                                                    className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground dark:text-white font-mono focus:outline-none focus:border-[#008080]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Nominal Payment Input */}
                                <div className="space-y-1.5 pt-1">
                                    <label className="text-xs font-semibold text-foreground dark:text-zinc-300 flex items-center justify-between">
                                        <span>Nominal Dibayarkan (Rp)</span>
                                        <span className="text-[10px] text-muted-foreground">Minimal Rp 1.000</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-muted-foreground">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            value={paymentAmountInput}
                                            onChange={e => setPaymentAmountInput(e.target.value)}
                                            placeholder="50000"
                                            required
                                            min="1000"
                                            className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground dark:text-white font-mono font-bold focus:outline-none focus:border-[#008080]"
                                        />
                                    </div>
                                </div>

                                {/* Payment Purpose / Notes */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground dark:text-zinc-300">
                                        Catatan / Keperluan Pembayaran <span className="text-[10px] text-muted-foreground font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentNotes}
                                        onChange={e => setPaymentNotes(e.target.value)}
                                        placeholder="Contoh: Sewa Lapangan Futsal Jam 19:00 - 21:00"
                                        className="w-full bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground dark:text-white focus:outline-none focus:border-[#008080]"
                                    />
                                </div>

                                {/* LIVE SALDO CHECKER WIDGET & INSUFFICIENT BALANCE WARNING */}
                                {(() => {
                                    const amt = parseFloat(paymentAmountInput) || 0;
                                    const isZero = amt <= 0;
                                    const isShort = room.wallet_balance < amt && !isZero;
                                    const shortage = amt - room.wallet_balance;

                                    return (
                                        <div className={`p-4 rounded-xl border space-y-2 text-xs transition-all ${
                                            isZero
                                                ? 'bg-zinc-500/10 border-zinc-500/20 text-muted-foreground'
                                                : isShort
                                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                        }`}>
                                            <div className="flex items-center justify-between font-mono">
                                                <span>Saldo Kas Room Saat Ini:</span>
                                                <span className="font-bold text-foreground dark:text-white">Rp {room.wallet_balance.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex items-center justify-between font-mono">
                                                <span>Total Dibayarkan:</span>
                                                <span className="font-bold text-foreground dark:text-white">Rp {amt.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="h-px bg-current/20 my-1" />
                                            {isZero ? (
                                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                                                    <Info className="w-4 h-4 shrink-0 text-amber-500" />
                                                    <span>Upload foto QRIS untuk deteksi harga otomatis atau masukkan nominal pembayaran di atas.</span>
                                                </div>
                                            ) : isShort ? (
                                                <div className="flex items-center justify-between font-bold text-rose-600 dark:text-rose-400">
                                                    <span className="flex items-center gap-1">
                                                        <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" /> Saldo Kas Kurang:
                                                    </span>
                                                    <span className="font-mono text-sm">Rp {shortage.toLocaleString('id-ID')}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Sisa Saldo Setelah Bayar:
                                                    </span>
                                                    <span className="font-mono text-sm">Rp {(room.wallet_balance - amt).toLocaleString('id-ID')}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-2">
                                    {(() => {
                                        const amt = parseFloat(paymentAmountInput) || 0;
                                        const isZero = amt <= 0;
                                        const isShort = room.wallet_balance < amt && !isZero;
                                        const shortage = amt - room.wallet_balance;

                                        if (isZero) {
                                            return (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                                                >
                                                    <SendHorizontal className="w-4 h-4" />
                                                    <span>Upload QRIS / Masukkan Nominal Pembayaran</span>
                                                </button>
                                            );
                                        }

                                        if (isShort) {
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowPaymentModal(false);
                                                        setCustomNominalInput(String(Math.ceil(shortage)));
                                                        setSelectedNominal(Math.ceil(shortage));
                                                        setShowTopUpModal(true);
                                                    }}
                                                    className="w-full py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    <span>Saldo Kurang Rp {shortage.toLocaleString('id-ID')} • Top Up Saldo Kas Sekarang</span>
                                                </button>
                                            );
                                        }

                                        return (
                                            <button
                                                type="submit"
                                                disabled={isSubmittingPayment}
                                                className="w-full py-3 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <SendHorizontal className="w-4 h-4" />
                                                <span>{isSubmittingPayment ? 'Memproses Pembayaran...' : `Konfirmasi & Bayar Rp ${amt.toLocaleString('id-ID')} Sekarang`}</span>
                                            </button>
                                        );
                                    })()}

                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentModal(false)}
                                        className="w-full py-2 text-xs text-muted-foreground hover:text-foreground font-semibold"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: STRUK PEMBAYARAN KAS DIGITAL (PAYMENT RECEIPT) */}
                {selectedPaymentReceipt && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="text-center border-b border-border dark:border-zinc-800 pb-3 space-y-1">
                                <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    ✓ Struk Resmi Pembayaran Kas Digital
                                </span>
                                <h3 className="font-bold text-foreground dark:text-white text-lg font-mono">
                                    {selectedPaymentReceipt.payment_number}
                                </h3>
                                <p className="text-[11px] text-muted-foreground">{selectedPaymentReceipt.created_at}</p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="p-3 bg-background dark:bg-zinc-950 rounded-xl border border-border dark:border-zinc-800 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Penerima / Merchant:</span>
                                        <span className="font-bold text-foreground dark:text-white">{selectedPaymentReceipt.recipient_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Metode Bayar:</span>
                                        <span className="font-mono uppercase font-bold text-[#008080]">{selectedPaymentReceipt.payment_method} ({selectedPaymentReceipt.bank_name || 'QRIS'})</span>
                                    </div>
                                    {selectedPaymentReceipt.recipient_account && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">NMI / Rekening:</span>
                                            <span className="font-mono">{selectedPaymentReceipt.recipient_account}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Disetujui Oleh:</span>
                                        <span className="font-semibold text-emerald-500">{selectedPaymentReceipt.user_name}</span>
                                    </div>
                                    {selectedPaymentReceipt.notes && (
                                        <div className="flex justify-between border-t border-border dark:border-zinc-800 pt-1.5">
                                            <span className="text-muted-foreground">Catatan / Keperluan:</span>
                                            <span className="italic">{selectedPaymentReceipt.notes}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Total Dibayarkan dari Kas</span>
                                    <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        Rp {selectedPaymentReceipt.amount.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 py-2.5 bg-[#008080] hover:bg-[#008080]/90 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" /> Cetak / Simpan Struk
                                </button>
                                <button
                                    onClick={() => setSelectedPaymentReceipt(null)}
                                    className="px-4 py-2.5 bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 hover:bg-zinc-800 text-foreground font-bold rounded-xl text-xs transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: RIWAYAT PENGELUARAN KAS DIGITAL ROOM */}
                {showPaymentHistoryModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
                            <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 pb-3 shrink-0">
                                <div>
                                    <h3 className="font-bold text-foreground dark:text-white text-base flex items-center gap-2">
                                        <Receipt className="w-5 h-5 text-[#008080]" /> Riwayat Pembayaran Kas Digital ({walletPayments.length})
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">Seluruh pengeluaran saldo kas room ke merchant & pihak ke-3.</p>
                                </div>
                                <button
                                    onClick={() => setShowPaymentHistoryModal(false)}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                                {walletPayments.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground space-y-2">
                                        <Receipt className="w-10 h-10 mx-auto opacity-40" />
                                        <p className="text-xs">Belum ada transaksi pembayaran keluar dari kas room.</p>
                                    </div>
                                ) : (
                                    walletPayments.map((pay) => (
                                        <div key={pay.id} className="p-3.5 bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground dark:text-white truncate">{pay.recipient_name}</span>
                                                    <span className="px-2 py-0.5 rounded bg-[#008080]/10 text-[#008080] text-[10px] font-mono font-bold uppercase">
                                                        {pay.payment_method}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {pay.notes || 'Pembayaran Pihak Ke-3'} • Disetujui: <strong className="text-foreground">{pay.user_name}</strong>
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-mono">{pay.payment_number} • {pay.created_at}</p>
                                            </div>
                                            <div className="text-right shrink-0 space-y-1">
                                                <p className="font-mono font-bold text-rose-500 text-sm">
                                                    - Rp {pay.amount.toLocaleString('id-ID')}
                                                </p>
                                                <button
                                                    onClick={() => setSelectedPaymentReceipt(pay)}
                                                    className="text-[10px] text-[#008080] hover:text-[#008080]/80 font-semibold flex items-center gap-1 ml-auto"
                                                >
                                                    <Receipt className="w-3 h-3" /> Struk
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-2 border-t border-border dark:border-zinc-800 shrink-0">
                                <button
                                    onClick={() => setShowPaymentHistoryModal(false)}
                                    className="w-full py-2 bg-background dark:bg-zinc-950 border border-border dark:border-zinc-800 hover:bg-zinc-800 text-foreground font-bold rounded-xl text-xs transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
