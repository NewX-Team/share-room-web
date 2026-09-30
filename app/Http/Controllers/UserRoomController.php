<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Room;
use App\Models\RoomAnnouncement;
use App\Models\RoomJoinRequest;
use App\Models\RoomMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                ];
            });

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
            ],
            'members' => $members,
            'messages' => $messages,
            'announcements' => $announcements,
            'pendingRequests' => $pendingRequests,
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
     * Send a new chat message in the room.
     */
    public function sendMessage(Request $request, string $code): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();

        if ($room->isExpired()) {
            return redirect()->back()->with('error', 'Room sudah kadaluarsa.');
        }

        Message::create([
            'room_id' => $room->id,
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
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
}
