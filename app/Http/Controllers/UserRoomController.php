<?php

namespace App\Http\Controllers;

use App\Models\KickedRoomNotice;
use App\Models\Message;
use App\Models\Room;
use App\Models\RoomAnnouncement;
use App\Models\RoomInvoice;
use App\Models\RoomJoinRequest;
use App\Models\RoomMember;
use App\Models\RoomMemberReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserRoomController extends Controller
{
    /**
     * Store a newly created room by user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:public,private'],
            'duration_hours' => ['required', 'integer', 'in:1,3,6,12,24,48'],
        ]);

        $user = $request->user();

        // Generate unique code (e.g. SR-8849)
        do {
            $code = 'SR-'.rand(1000, 9999);
        } while (Room::where('code', $code)->exists());

        $room = Room::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'code' => $code,
            'type' => $validated['type'],
            'duration_hours' => $validated['duration_hours'],
            'expires_at' => now()->addHours((int) $validated['duration_hours']),
            'wallet_balance' => 0, // Initial wallet balance is set to 0
        ]);

        // Attach creator as Owner of the room
        RoomMember::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'role_in_room' => 'owner',
        ]);

        return redirect()->route('rooms.show', $room->code)->with('success', 'Room berhasil dibuat!');
    }

    /**
     * Join an existing room via unique code.
     */
    public function join(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($validated['code']));
        $room = Room::where('code', $code)->first();

        if (! $room) {
            return redirect()->back()->with('error', 'Kode room tidak ditemukan.');
        }

        if ($room->isExpired()) {
            return redirect()->back()->with('error', 'Room ini sudah kadaluarsa dan tidak aktif.');
        }

        $user = $request->user();

        // Check if user is already a member or owner
        $isMember = RoomMember::where('room_id', $room->id)->where('user_id', $user->id)->exists();
        if ($isMember) {
            return redirect()->route('rooms.show', $room->code);
        }

        // Public Room: Join immediately
        if ($room->type === 'public') {
            RoomMember::create([
                'room_id' => $room->id,
                'user_id' => $user->id,
                'role_in_room' => 'member',
            ]);

            return redirect()->route('rooms.show', $room->code)->with('success', 'Berhasil bergabung ke room public!');
        }

        // Private Room: Requires Owner Approval
        $activeRequest = RoomJoinRequest::where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if ($activeRequest) {
            if ($activeRequest->status === 'pending') {
                return redirect()->back()->with('info', 'Permintaan gabung Anda sedang menunggu persetujuan Owner room (berlaku 24 jam).');
            }

            if ($activeRequest->status === 'rejected') {
                return redirect()->back()->with('error', 'Permintaan gabung Anda ke room private ini sebelumnya telah ditolak oleh Owner.');
            }
        }

        // Create new pending join request valid for 24 hours
        RoomJoinRequest::updateOrCreate(
            ['room_id' => $room->id, 'user_id' => $user->id],
            [
                'status' => 'pending',
                'expires_at' => now()->addHours(24),
            ]
        );

        return redirect()->back()->with('info', 'Permintaan gabung terkirim! Room ini bersifat Private, silakan menunggu persetujuan dari Owner room.');
    }

    /**
     * Display the room chat detail page.
     */
    public function show(Request $request, string $code): Response|RedirectResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->first();

        if (! $room) {
            return redirect()->route('dashboard')->with('error', 'Room tidak ditemukan.');
        }

        if ($room->isExpired()) {
            return redirect()->route('dashboard')->with('error', 'Durasi room telah berakhir.');
        }

        $user = $request->user();

        // Check member record
        $memberRecord = RoomMember::where('room_id', $room->id)->where('user_id', $user->id)->first();

        if (! $memberRecord) {
            // Auto join if room is Public
            if ($room->type === 'public') {
                $memberRecord = RoomMember::create([
                    'room_id' => $room->id,
                    'user_id' => $user->id,
                    'role_in_room' => $room->user_id === $user->id ? 'owner' : 'member',
                ]);
            } else {
                // Private room without member record: redirect to dashboard
                return redirect()->route('dashboard')->with('error', 'Room ini bersifat Private. Anda harus menunggu persetujuan Owner room untuk dapat masuk.');
            }
        }

        // Fetch members with user info
        $members = RoomMember::with('user:id,name,email')
            ->where('room_id', $room->id)
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'name' => $member->user->name ?? 'User',
                    'email' => $member->user->email ?? '',
                    'role_in_room' => $member->role_in_room,
                    'joined_at' => $member->created_at->diffForHumans(),
                ];
            });

        // Fetch chat messages with user info
        $messages = Message::with('user:id,name,email')
            ->where('room_id', $room->id)
            ->oldest()
            ->get()
            ->map(function ($msg) use ($members) {
                $memberRole = $members->firstWhere('user_id', $msg->user_id)['role_in_room'] ?? 'member';

                return [
                    'id' => $msg->id,
                    'user_id' => $msg->user_id,
                    'user_name' => $msg->user->name ?? 'User',
                    'role_in_room' => $memberRole,
                    'message' => $msg->message,
                    'time' => $msg->created_at->format('H:i'),
                    'file_path' => $msg->file_path ? asset('storage/' . $msg->file_path) : null,
                    'file_name' => $msg->file_name,
                    'file_type' => $msg->file_type,
                    'file_size' => $msg->file_size,
                ];
            });

        // Count total file uploads in this room across all members
        $roomFileCount = Message::where('room_id', $room->id)
            ->whereNotNull('file_path')
            ->count();

        // Fetch announcements/notifications for the room
        $announcements = $room->announcements()
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($ann) {
                return [
                    'id' => $ann->id,
                    'type' => $ann->type,
                    'title' => $ann->title,
                    'message' => $ann->message,
                    'created_at' => $ann->created_at->diffForHumans(),
                ];
            });

        // Pending Join Requests for Owner or Admin
        $isOwner = $room->user_id === $user->id;
        $pendingRequests = [];
        if ($isOwner || $user->isAdmin()) {
            $pendingRequests = RoomJoinRequest::with('user:id,name,email')
                ->where('room_id', $room->id)
                ->where('status', 'pending')
                ->where('expires_at', '>', now())
                ->latest()
                ->get()
                ->map(function ($req) {
                    return [
                        'id' => $req->id,
                        'user_id' => $req->user_id,
                        'name' => $req->user->name ?? 'User',
                        'email' => $req->user->email ?? '',
                        'created_at' => $req->created_at->diffForHumans(),
                        'time_left' => $req->expires_at->diffForHumans(['syntax' => \Carbon\CarbonInterface::DIFF_RELATIVE_TO_NOW]),
                    ];
                });
        }

        // Track last read message ID for current user before updating
        $currentMemberRecord = RoomMember::where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->first();

        $lastReadMessageId = $currentMemberRecord ? $currentMemberRecord->last_read_message_id : null;

        $latestMessageId = Message::where('room_id', $room->id)->max('id');
        if ($currentMemberRecord && $latestMessageId) {
            $currentMemberRecord->update([
                'last_read_message_id' => $latestMessageId,
            ]);
        }

        $premiumPrice = $room->calculatePremiumPrice();
        $invoices = RoomInvoice::with('user:id,name,email')
            ->where('room_id', $room->id)
            ->latest()
            ->get()
            ->map(function ($inv) {
                return [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'user_name' => $inv->user->name ?? 'User',
                    'feature_name' => $inv->feature_name,
                    'amount' => (float) $inv->amount,
                    'duration_hours' => $inv->duration_hours,
                    'paid_at' => $inv->paid_at->format('d M Y, H:i'),
                ];
            });

        // Fetch reports for Owner or Admin
        $reports = [];
        if ($isOwner || $user->isAdmin()) {
            $reports = RoomMemberReport::with(['reporter:id,name,email', 'reported:id,name,email'])
                ->where('room_id', $room->id)
                ->latest()
                ->get()
                ->map(function ($rep) {
                    return [
                        'id' => $rep->id,
                        'reporter_id' => $rep->reporter_id,
                        'reporter_name' => $rep->reporter->name ?? 'User',
                        'reporter_email' => $rep->reporter->email ?? '',
                        'reported_id' => $rep->reported_id,
                        'reported_name' => $rep->reported->name ?? 'User',
                        'reported_email' => $rep->reported->email ?? '',
                        'reason_category' => $rep->reason_category,
                        'description' => $rep->description,
                        'status' => $rep->status,
                        'created_at' => $rep->created_at->diffForHumans(),
                    ];
                });
        }

        $userRoleInRoom = $currentMemberRecord ? $currentMemberRecord->role_in_room : ($isOwner ? 'owner' : 'member');
        $canUseWallet = $isOwner || $user->isAdmin() || ($currentMemberRecord && $currentMemberRecord->role_in_room === 'bendahara');

        $extensionPackages = \App\Models\RoomExtensionPackage::where('is_active', true)
            ->oldest('hours')
            ->get()
            ->map(function ($pkg) {
                return [
                    'id' => $pkg->id,
                    'hours' => $pkg->hours,
                    'price' => (float) $pkg->price,
                ];
            });

        return Inertia::render('rooms/show', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'code' => $room->code,
                'type' => $room->type ?? 'public',
                'duration_hours' => $room->duration_hours,
                'expires_at' => $room->expires_at->toIso8601String(),
                'wallet_balance' => (float) $room->wallet_balance,
                'is_frozen' => (bool) $room->is_frozen,
                'freeze_reason' => $room->freeze_reason,
                'is_owner' => $isOwner,
                'is_premium' => (bool) $room->is_premium,
                'premium_price' => $premiumPrice,
                'user_role_in_room' => $userRoleInRoom,
                'can_use_wallet' => $canUseWallet,
            ],
            'members' => $members,
            'messages' => $messages,
            'announcements' => $announcements,
            'pendingRequests' => $pendingRequests,
            'userFileCount' => $roomFileCount,
            'maxFiles' => 20,
            'lastReadMessageId' => $lastReadMessageId,
            'invoices' => $invoices,
            'reports' => $reports,
            'extensionPackages' => $extensionPackages,
        ]);
    }

    /**
     * Owner approves a user's join request to a private room.
     */
    public function approveJoinRequest(Request $request, string $code, int $requestId): RedirectResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        if ($room->user_id !== $currentUser->id && ! $currentUser->isAdmin()) {
            return redirect()->back()->with('error', 'Hanya Owner Room yang dapat menyetujui permintaan gabung.');
        }

        $joinRequest = RoomJoinRequest::where('room_id', $room->id)->where('id', $requestId)->firstOrFail();

        $joinRequest->update([
            'status' => 'approved',
        ]);

        // Attach user to room members
        RoomMember::firstOrCreate(
            ['room_id' => $room->id, 'user_id' => $joinRequest->user_id],
            ['role_in_room' => 'member']
        );

        // Add room announcement
        $requestUser = $joinRequest->user;
        $userName = $requestUser ? $requestUser->name : 'Anggota baru';

        RoomAnnouncement::create([
            'room_id' => $room->id,
            'type' => 'info',
            'title' => 'Anggota Baru Bergabung',
            'message' => "{$userName} telah disetujui bergabung ke room oleh Owner.",
        ]);

        return redirect()->back()->with('success', "Permintaan gabung {$userName} berhasil disetujui!");
    }

    /**
     * Owner rejects a user's join request to a private room.
     */
    public function rejectJoinRequest(Request $request, string $code, int $requestId): RedirectResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        if ($room->user_id !== $currentUser->id && ! $currentUser->isAdmin()) {
            return redirect()->back()->with('error', 'Hanya Owner Room yang dapat menolak permintaan gabung.');
        }

        $joinRequest = RoomJoinRequest::where('room_id', $room->id)->where('id', $requestId)->firstOrFail();

        $joinRequest->update([
            'status' => 'rejected',
        ]);

        return redirect()->back()->with('success', 'Permintaan gabung telah ditolak.');
    }

    /**
     * Dismiss a rejected or expired join request from user dashboard.
     */
    public function dismissJoinRequest(Request $request, int $requestId): RedirectResponse
    {
        $currentUser = $request->user();
        $joinRequest = RoomJoinRequest::where('user_id', $currentUser->id)->where('id', $requestId)->first();

        if ($joinRequest) {
            $joinRequest->delete();
        }

        return redirect()->back()->with('success', 'Permintaan room berhasil dihapus dari daftar pending.');
    }

    /**
     * Purchase Premium Pass for the room using Digital Wallet balance.
     */
    public function buyPremium(Request $request, string $code): RedirectResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();

        if ($room->isExpired()) {
            return redirect()->back()->with('error', 'Room sudah kadaluarsa.');
        }

        if ($room->is_premium) {
            return redirect()->back()->with('info', 'Fitur Premium Pass untuk room ini sudah aktif!');
        }

        $user = $request->user();
        $isOwner = $room->user_id === $user->id;
        $memberRecord = RoomMember::where('room_id', $room->id)->where('user_id', $user->id)->first();
        $canUseWallet = $isOwner || $user->isAdmin() || ($memberRecord && $memberRecord->role_in_room === 'bendahara');

        if (! $canUseWallet) {
            return redirect()->back()->with('error', 'Hanya Owner Room dan Bendahara yang memiliki wewenang untuk menggunakan saldo kas digital room.');
        }

        $price = $room->calculatePremiumPrice();

        if ($room->wallet_balance < $price) {
            return redirect()->back()->with('error', 'Saldo Dompet Digital Room tidak mencukupi (Saldo: Rp ' . number_format($room->wallet_balance, 0, ',', '.') . ', Harga: Rp ' . number_format($price, 0, ',', '.') . '). Silakan Top Up Saldo Kas Room terlebih dahulu.');
        }

        // Deduct room wallet balance and activate premium status
        $room->wallet_balance -= $price;
        $room->is_premium = true;
        $room->save();

        // Create Room Invoice
        $invoice = RoomInvoice::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'invoice_number' => 'INV-PRO-' . strtoupper(Str::random(8)),
            'feature_name' => 'ShareRoom Pro Pass (Unlimited File & Premium Badge)',
            'amount' => $price,
            'duration_hours' => $room->duration_hours,
            'paid_at' => now(),
        ]);

        // Post Room Announcement visible to all members
        RoomAnnouncement::create([
            'room_id' => $room->id,
            'type' => 'success',
            'title' => '👑 FITUR PREMIUM PASS AKTIF!',
            'message' => "{$user->name} telah mengaktifkan Paket Premium Pass seharga Rp " . number_format($price, 0, ',', '.') . " menggunakan Saldo Dompet Digital Room. Seluruh member kini menikmati fitur Unggah File Tanpa Batas!",
        ]);

        // Post automated Chat Message so all members see it in the feed
        Message::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'message' => "🎉 TELAH MENG-UPGRADE ROOM KE PREMIUM PASS! 👑\nNo. Invoice: {$invoice->invoice_number}\nTotal Pembayaran: Rp " . number_format($price, 0, ',', '.') . "\nStatus: Fitur Unggah File Tanpa Batas Aktif untuk Seluruh Member!",
        ]);

        return redirect()->back()->with('success', 'Selamat! Fitur Premium Pass berhasil diaktifkan untuk seluruh member di room ini.');
    }

    /**
     * Extend room duration using Digital Wallet balance.
     */
    public function extendDuration(Request $request, string $code): RedirectResponse
    {
        $validated = $request->validate([
            'package_id' => ['required', 'integer', 'exists:room_extension_packages,id'],
        ]);

        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();

        if ($room->isExpired()) {
            return redirect()->back()->with('error', 'Room sudah kadaluarsa dan tidak aktif.');
        }

        $user = $request->user();
        $isOwner = $room->user_id === $user->id;
        $memberRecord = RoomMember::where('room_id', $room->id)->where('user_id', $user->id)->first();
        $canUseWallet = $isOwner || $user->isAdmin() || ($memberRecord && $memberRecord->role_in_room === 'bendahara');

        if (! $canUseWallet) {
            return redirect()->back()->with('error', 'Hanya Owner Room dan Bendahara yang memiliki wewenang untuk memperpanjang durasi menggunakan saldo kas digital.');
        }

        $package = \App\Models\RoomExtensionPackage::where('id', $validated['package_id'])
            ->where('is_active', true)
            ->first();

        if (! $package) {
            return redirect()->back()->with('error', 'Paket perpanjangan durasi yang dipilih tidak tersedia.');
        }

        if ($room->wallet_balance < $package->price) {
            return redirect()->back()->with('error', 'Saldo Dompet Digital Room tidak mencukupi (Saldo: Rp ' . number_format($room->wallet_balance, 0, ',', '.') . ', Harga: Rp ' . number_format($package->price, 0, ',', '.') . '). Silakan Top Up Saldo Kas Room terlebih dahulu.');
        }

        // Deduct room wallet balance and extend room expiration time
        $room->wallet_balance -= $package->price;
        $room->expires_at = \Carbon\Carbon::parse($room->expires_at)->addHours($package->hours);
        $room->save();

        // Create Room Invoice
        $invoice = RoomInvoice::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'invoice_number' => 'INV-EXT-' . strtoupper(Str::random(8)),
            'feature_name' => "Perpanjangan Durasi Room +{$package->hours} Jam",
            'amount' => $package->price,
            'duration_hours' => $package->hours,
            'paid_at' => now(),
        ]);

        $newExpiration = \Carbon\Carbon::parse($room->expires_at)->format('d M Y, H:i');

        // Post Room Announcement visible to all members
        RoomAnnouncement::create([
            'room_id' => $room->id,
            'type' => 'success',
            'title' => '⏳ DURASI ROOM BERHASIL DIPERPANJANG!',
            'message' => "{$user->name} telah memperpanjang durasi room sebanyak +{$package->hours} Jam seharga Rp " . number_format($package->price, 0, ',', '.') . " menggunakan Saldo Dompet Digital. Masa aktif room kini berlaku hingga {$newExpiration}.",
        ]);

        // Post automated Chat Message so all members see it in the feed
        Message::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'message' => "⏳ TELAH MEMPERPANJANG DURASI ROOM! 🕒\nNo. Invoice: {$invoice->invoice_number}\nPenambahan Waktu: +{$package->hours} Jam\nTotal Pembayaran Kas: Rp " . number_format($package->price, 0, ',', '.') . "\nWaktu Kadaluarsa Baru: {$newExpiration}",
        ]);

        return redirect()->back()->with('success', "Durasi room berhasil diperpanjang +{$package->hours} Jam!");
    }

    /**
     * Send a new chat message or file attachment in the room.
     */
    public function sendMessage(Request $request, string $code): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:1000'],
            'file' => ['nullable', 'file', 'max:25600'], // max 25MB
        ]);

        if (empty($validated['message']) && !$request->hasFile('file')) {
            return redirect()->back()->with('error', 'Silakan ketik pesan atau pilih file untuk dikirim.');
        }

        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();

        if ($room->isExpired()) {
            return redirect()->back()->with('error', 'Room sudah kadaluarsa.');
        }

        $user = $request->user();
        $filePath = null;
        $fileName = null;
        $fileType = null;
        $fileSize = null;

        if ($request->hasFile('file')) {
            // Enforce 20 file limit total across all members in this room (unless Premium Pass is active)
            if (!$room->is_premium) {
                $roomFileCount = Message::where('room_id', $room->id)
                    ->whereNotNull('file_path')
                    ->count();

                if ($roomFileCount >= 20) {
                    return redirect()->back()->with('error', 'Batas total 20 file untuk room ini telah tercapai (seluruh member). Silakan upgrade ke Premium untuk upload tanpa batas.');
                }
            }

            $file = $request->file('file');
            $ext = strtolower($file->getClientOriginalExtension());
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar', '7z', 'tar', 'gz'];

            if (!in_array($ext, $allowedExtensions)) {
                return redirect()->back()->with('error', "Format file .{$ext} tidak diizinkan. Silakan kompres file tersebut menjadi format .ZIP atau kirim berkas dokumen/foto yang sesuai kriteria.");
            }

            $filePath = $file->store('room_files', 'public');
            $fileName = $file->getClientOriginalName();
            $fileSize = $file->getSize();

            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
                $fileType = 'image';
            } elseif (in_array($ext, ['zip', 'rar', '7z', 'tar', 'gz'])) {
                $fileType = 'archive';
            } elseif (in_array($ext, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'])) {
                $fileType = 'document';
            } else {
                $fileType = 'other';
            }
        }

        $messageText = $validated['message'] ?? '';
        if (empty($messageText) && $fileName) {
            $messageText = "File: {$fileName}";
        }

        Message::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'message' => $messageText,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_type' => $fileType,
            'file_size' => $fileSize,
        ]);

        return redirect()->back();
    }

    /**
     * Update a member's role in the room.
     */
    public function updateMemberRole(Request $request, string $code, int $memberId): RedirectResponse
    {
        $validated = $request->validate([
            'role_in_room' => ['required', 'string', 'in:bendahara,member'],
        ]);

        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        if ($room->user_id !== $currentUser->id && ! $currentUser->isAdmin()) {
            return redirect()->back()->with('error', 'Hanya Owner Room yang dapat mengubah role anggota.');
        }

        $member = RoomMember::where('room_id', $room->id)->where('id', $memberId)->firstOrFail();

        if ($member->role_in_room === 'owner') {
            return redirect()->back()->with('error', 'Role Owner Room tidak dapat diubah.');
        }

        $member->update([
            'role_in_room' => $validated['role_in_room'],
        ]);

        return redirect()->back()->with('success', 'Role anggota berhasil diperbarui!');
    }

    /**
     * Kick a member from the room.
     */
    public function kickMember(Request $request, string $code, int $memberId): RedirectResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        if ($room->user_id !== $currentUser->id && ! $currentUser->isAdmin()) {
            return redirect()->back()->with('error', 'Hanya Owner Room yang dapat meng-kick anggota.');
        }

        $member = RoomMember::where('room_id', $room->id)->where('id', $memberId)->firstOrFail();

        if ($member->role_in_room === 'owner') {
            return redirect()->back()->with('error', 'Tidak dapat mengeluarkan Owner Room.');
        }

        $member->delete();

        return redirect()->back()->with('success', 'Anggota berhasil dikeluarkan dari room.');
    }

    /**
     * Member leaves the room.
     */
    public function leave(Request $request, string $code): RedirectResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        if ($room->user_id === $currentUser->id) {
            return redirect()->back()->with('error', 'Owner Room tidak dapat keluar secara biasa. Silakan hapus room.');
        }

        RoomMember::where('room_id', $room->id)->where('user_id', $currentUser->id)->delete();

        return redirect()->route('dashboard')->with('success', 'Anda telah keluar dari room.');
    }

    /**
     * Remove room history item from user dashboard.
     */
    public function removeHistory(Request $request, int $roomId): RedirectResponse
    {
        $currentUser = $request->user();
        $room = Room::find($roomId);

        $memberRecord = RoomMember::where('room_id', $roomId)->where('user_id', $currentUser->id)->first();

        if ($memberRecord && $room && ! $room->isExpired()) {
            return redirect()->back()->with('error', 'Anda masih terdaftar di room aktif ini! Silakan keluar dari room terlebih dahulu sebelum menghapus riwayat.');
        }

        if ($memberRecord) {
            $memberRecord->delete();
        }

        return redirect()->back()->with('success', 'Riwayat room berhasil dihapus dari dashboard.');
    }

    /**
     * Submit a report against a room member.
     */
    public function reportMember(Request $request, string $code): RedirectResponse
    {
        $validated = $request->validate([
            'reported_id' => ['required', 'integer', 'exists:users,id'],
            'reason_category' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
        ]);

        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        if ($validated['reported_id'] == $currentUser->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat melaporkan diri sendiri.');
        }

        if ($validated['reported_id'] == $room->user_id) {
            return redirect()->back()->with('error', 'Owner Room tidak dapat dilaporkan.');
        }

        $reporterIsMember = RoomMember::where('room_id', $room->id)->where('user_id', $currentUser->id)->exists();
        $reportedIsMember = RoomMember::where('room_id', $room->id)->where('user_id', $validated['reported_id'])->exists();

        if (!$reporterIsMember || !$reportedIsMember) {
            return redirect()->back()->with('error', 'Pengguna harus merupakan anggota dari room ini.');
        }

        RoomMemberReport::create([
            'room_id' => $room->id,
            'reporter_id' => $currentUser->id,
            'reported_id' => $validated['reported_id'],
            'reason_category' => $validated['reason_category'],
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Laporan Anda telah berhasil dikirim kepada Owner Room untuk ditindaklanjuti.');
    }

    /**
     * Owner dismisses a report and keeps the member.
     */
    public function dismissReport(Request $request, string $code, int $reportId): RedirectResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        if ($room->user_id !== $currentUser->id && !$currentUser->isAdmin()) {
            return redirect()->back()->with('error', 'Hanya Owner Room yang dapat mengelola laporan anggota.');
        }

        $report = RoomMemberReport::where('room_id', $room->id)->where('id', $reportId)->firstOrFail();
        $report->update(['status' => 'dismissed']);

        return redirect()->back()->with('success', 'Laporan diabaikan. Member tetap dipertahankan di room.');
    }

    /**
     * Owner kicks a reported member based on a report.
     */
    public function kickReportedMember(Request $request, string $code, int $reportId): RedirectResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        if ($room->user_id !== $currentUser->id && !$currentUser->isAdmin()) {
            return redirect()->back()->with('error', 'Hanya Owner Room yang dapat mengeksekusi keluarkan (kick) anggota.');
        }

        $report = RoomMemberReport::with('reported')->where('room_id', $room->id)->where('id', $reportId)->firstOrFail();
        $reportedUser = $report->reported;
        $reportedName = $reportedUser ? $reportedUser->name : 'Anggota';

        $report->update(['status' => 'actioned_kick']);

        // Remove reported user from room members
        RoomMember::where('room_id', $room->id)->where('user_id', $report->reported_id)->delete();

        // Create announcement in room
        RoomAnnouncement::create([
            'room_id' => $room->id,
            'type' => 'freeze',
            'title' => 'Anggota Dikeluarkan (Kick)',
            'message' => "{$reportedName} telah dikeluarkan dari room oleh Owner berdasarkan laporan dari anggota lain.",
        ]);

        // Create kicked notice for the user so it displays on their Dashboard
        KickedRoomNotice::create([
            'user_id' => $report->reported_id,
            'room_id' => $room->id,
            'room_name' => $room->name,
            'room_code' => $room->code,
            'reason' => "Anda telah dikeluarkan dari room \"{$room->name}\" oleh Owner karena adanya laporan dari anggota lain.",
            'is_read' => false,
        ]);

        return redirect()->back()->with('success', "Member {$reportedName} berhasil dikeluarkan dari room berdasarkan laporan!");
    }

    /**
     * Dismiss a kicked notice from user dashboard.
     */
    public function dismissKickedNotice(Request $request, int $noticeId): RedirectResponse
    {
        $currentUser = $request->user();
        $notice = KickedRoomNotice::where('user_id', $currentUser->id)->where('id', $noticeId)->first();

        if ($notice) {
            $notice->delete();
        }

        return redirect()->back()->with('success', 'Pemberitahuan telah dihapus.');
    }
}
