<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomAnnouncement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Display a listing of all rooms for Admin.
     */
    public function index(): Response
    {
        return Inertia::render('admin/rooms/index', [
            'rooms' => Room::with('user:id,name,email')
                ->withCount('members')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Add funds to room digital wallet manually.
     */
    public function addFunds(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $amount = (float) $validated['amount'];
        $room->increment('wallet_balance', $amount);

        // Create notification announcement for members in room
        RoomAnnouncement::create([
            'room_id' => $room->id,
            'type' => 'add_funds',
            'title' => 'Penambahan Saldo oleh Admin',
            'message' => 'Admin telah menambahkan saldo sebesar Rp ' . number_format($amount, 0, ',', '.') . ' ke kas dompet digital room.',
        ]);

        return redirect()->back()->with('success', 'Saldo kas dompet room berhasil ditambahkan!');
    }

    /**
     * Freeze room digital wallet with required reason.
     */
    public function freezeWallet(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $room->update([
            'is_frozen' => true,
            'freeze_reason' => $validated['reason'],
        ]);

        // Create notification announcement for members in room
        RoomAnnouncement::create([
            'room_id' => $room->id,
            'type' => 'freeze',
            'title' => 'Dompet Digital Dibekukan Admin',
            'message' => 'Dompet digital room telah dibekukan oleh Admin. Alasan: "' . $validated['reason'] . '"',
        ]);

        return redirect()->back()->with('success', 'Dompet digital room berhasil dibekukan.');
    }

    /**
     * Unfreeze room digital wallet.
     */
    public function unfreezeWallet(Room $room): RedirectResponse
    {
        $room->update([
            'is_frozen' => false,
            'freeze_reason' => null,
        ]);

        // Create notification announcement for members in room
        RoomAnnouncement::create([
            'room_id' => $room->id,
            'type' => 'unfreeze',
            'title' => 'Dompet Digital Diaktifkan Kembali',
            'message' => 'Dompet digital room telah diaktifkan kembali oleh Admin.',
        ]);

        return redirect()->back()->with('success', 'Dompet digital room telah diaktifkan kembali.');
    }

    /**
     * Remove the specified room.
     */
    public function destroy(Room $room): RedirectResponse
    {
        $room->delete();

        return redirect()->back()->with('success', 'Room berhasil dihapus!');
    }
}
