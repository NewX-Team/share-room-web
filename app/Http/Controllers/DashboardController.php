<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomJoinRequest;
use App\Models\RoomMember;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the application dashboard with real-time stats.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();

        // Real-time statistics from database
        $stats = [
            'totalUsers' => User::count(),
            'totalRooms' => Room::count(),
            'totalActiveRooms' => Room::where('expires_at', '>', now())->count(),
            'totalWalletBalance' => (float) Room::sum('wallet_balance'),
        ];

        // Real User list for Admin
        $users = $currentUser->isAdmin()
            ? User::select(['id', 'name', 'email', 'role', 'created_at'])->latest()->get()
            : [];

        // Pending Join Requests for Regular User (last 24h)
        $pendingJoinRequests = [];
        if (! $currentUser->isAdmin()) {
            $pendingJoinRequests = RoomJoinRequest::with('room:id,name,code,type,user_id')
                ->where('user_id', $currentUser->id)
                ->where('expires_at', '>', now())
                ->latest()
                ->get()
                ->map(function ($req) {
                    return [
                        'id' => $req->id,
                        'room_id' => $req->room_id,
                        'room_name' => $req->room->name ?? 'Room',
                        'room_code' => $req->room->code ?? '',
                        'status' => $req->status, // 'pending', 'rejected', 'approved'
                        'created_at' => $req->created_at->diffForHumans(),
                        'time_left' => $req->expires_at->diffForHumans(['syntax' => \Carbon\CarbonInterface::DIFF_RELATIVE_TO_NOW]),
                    ];
                });
        }

        // Real Room list for Admin or User
        if ($currentUser->isAdmin()) {
            $rooms = Room::with('user:id,name,email')->latest()->get();
        } else {
            // Fetch all rooms where current user is a member
            $rooms = Room::whereHas('members', function ($query) use ($currentUser) {
                $query->where('user_id', $currentUser->id);
            })->latest()->get()->map(function ($room) use ($currentUser) {
                $memberRecord = RoomMember::where('room_id', $room->id)
                    ->where('user_id', $currentUser->id)
                    ->first();

                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'code' => $room->code,
                    'type' => $room->type ?? 'public',
                    'duration_hours' => $room->duration_hours,
                    'expires_at' => $room->expires_at->toIso8601String(),
                    'wallet_balance' => (float) $room->wallet_balance,
                    'role_in_room' => $memberRecord->role_in_room ?? 'member',
                    'is_owner' => $room->user_id === $currentUser->id,
                    'is_joined' => $memberRecord !== null,
                    'is_expired' => $room->isExpired(),
                ];
            });
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'users' => $users,
            'rooms' => $rooms,
            'pendingJoinRequests' => $pendingJoinRequests,
        ]);
    }
}
