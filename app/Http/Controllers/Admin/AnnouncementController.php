<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GlobalAnnouncement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of all global announcements for Admin.
     */
    public function index(): Response
    {
        $announcements = GlobalAnnouncement::with('author:id,name,email')
            ->latest()
            ->get()
            ->map(function ($ann) {
                return [
                    'id' => $ann->id,
                    'title' => $ann->title,
                    'category' => $ann->category,
                    'content' => $ann->content,
                    'is_pinned' => (bool) $ann->is_pinned,
                    'is_active' => (bool) $ann->is_active,
                    'author_name' => $ann->author->name ?? 'Admin',
                    'created_at' => $ann->created_at->format('d M Y, H:i'),
                ];
            });

        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Store a newly created global announcement.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:info,update,promo,warning'],
            'content' => ['required', 'string'],
            'is_pinned' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        GlobalAnnouncement::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'category' => $validated['category'],
            'content' => $validated['content'],
            'is_pinned' => $request->boolean('is_pinned'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', 'Pengumuman berhasil dipublikasikan!');
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(GlobalAnnouncement $announcement): RedirectResponse
    {
        $announcement->update([
            'is_active' => ! $announcement->is_active,
        ]);

        $statusStr = $announcement->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Pengumuman berhasil {$statusStr}.");
    }

    /**
     * Toggle pinned status.
     */
    public function togglePin(GlobalAnnouncement $announcement): RedirectResponse
    {
        $announcement->update([
            'is_pinned' => ! $announcement->is_pinned,
        ]);

        $pinStr = $announcement->is_pinned ? 'sematkan (pin)' : 'lepas sematan';

        return redirect()->back()->with('success', "Pengumuman berhasil di-{$pinStr}.");
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(GlobalAnnouncement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
