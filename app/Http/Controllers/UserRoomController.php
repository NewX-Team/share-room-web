<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Room;
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
            return redirect()->back()->with('error', 'Room ini sudah kadaluarsa dan otomatis terhapus.');
        }

        $user = $request->user();

        // Attach user as member if not already joined
        RoomMember::firstOrCreate(
            ['room_id' => $room->id, 'user_id' => $user->id],
            ['role_in_room' => 'member']
        );

        return redirect()->route('rooms.show', $room->code);
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

        // Auto join user as member if opening the link directly
        $memberRecord = RoomMember::where('room_id', $room->id)->where('user_id', $user->id)->first();

        if (! $memberRecord) {
            $memberRecord = RoomMember::create([
                'room_id' => $room->id,
                'user_id' => $user->id,
                'role_in_room' => $room->user_id === $user->id ? 'owner' : 'member',
            ]);
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
                    'role_in_room' => $member->role_in_room, // 'owner', 'bendahara', or 'member'
                    'joined_at' => $member->created_at->diffForHumans(),
                ];
            });

        // Fetch chat messages with user info
        $messages = Message::with('user:id,name,email')
            ->where('room_id', $room->id)
            ->oldest()
            ->get()
            ->map(function ($msg) use ($members) {
                // Find member role in room
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

        return Inertia::render('rooms/show', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'code' => $room->code,
                'duration_hours' => $room->duration_hours,
                'expires_at' => $room->expires_at->toIso8601String(),
                'wallet_balance' => (float) $room->wallet_balance,
                'is_frozen' => (bool) $room->is_frozen,
                'freeze_reason' => $room->freeze_reason,
                'is_owner' => $room->user_id === $user->id,
            ],
            'members' => $members,
            'messages' => $messages,
            'announcements' => $announcements,
        ]);
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
     * Update a member's role in the room (e.g. promote to 'bendahara' or demote to 'member').
     */
    public function updateMemberRole(Request $request, string $code, int $memberId): RedirectResponse
    {
        $validated = $request->validate([
            'role_in_room' => ['required', 'string', 'in:bendahara,member'],
        ]);

        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $currentUser = $request->user();

        // Only Room Owner or Admin can assign roles
        if ($room->user_id !== $currentUser->id && ! $currentUser->isAdmin()) {
            return redirect()->back()->with('error', 'Hanya Owner Room yang dapat mengubah role anggota.');
        }

        $member = RoomMember::where('room_id', $room->id)->where('id', $memberId)->firstOrFail();

        // Cannot change owner role
        if ($member->role_in_room === 'owner') {
            return redirect()->back()->with('error', 'Role Owner Room tidak dapat diubah.');
        }

        $member->update([
            'role_in_room' => $validated['role_in_room'],
        ]);

        return redirect()->back()->with('success', 'Role anggota berhasil diperbarui!');
    }

    /**
     * Kick a member from the room (Owner or Admin action).
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

        // Cannot kick the owner
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
     * Remove room history item from user dashboard (only allowed if already left room or expired).
     */
    public function removeHistory(Request $request, int $roomId): RedirectResponse
    {
        $currentUser = $request->user();
        $room = Room::find($roomId);

        // Check if member is still joined in an active room
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
