<?php

namespace App\Http\Controllers;

use App\Models\Room;
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
        ]);
    }
}
