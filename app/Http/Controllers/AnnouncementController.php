<?php

namespace App\Http\Controllers;

use App\Models\GlobalAnnouncement;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of active global announcements for regular users.
     */
    public function index(): Response
    {
        $announcements = GlobalAnnouncement::with('author:id,name,email')
            ->where('is_active', true)
            ->orderBy('is_pinned', 'desc')
            ->latest()
            ->get()
            ->map(function ($ann) {
                return [
                    'id' => $ann->id,
                    'title' => $ann->title,
                    'category' => $ann->category,
                    'content' => $ann->content,
                    'is_pinned' => (bool) $ann->is_pinned,
                    'author_name' => $ann->author->name ?? 'Administrator',
                    'date' => $ann->created_at->format('d M Y, H:i'),
                    'time_ago' => $ann->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('announcements/index', [
            'announcements' => $announcements,
        ]);
    }
}
