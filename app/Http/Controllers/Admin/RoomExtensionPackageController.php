<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RoomExtensionPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomExtensionPackageController extends Controller
{
    /**
     * Display a listing of room extension packages.
     */
    public function index(): Response
    {
        $packages = RoomExtensionPackage::oldest('hours')->get();

        return Inertia::render('admin/extension-packages/index', [
            'packages' => $packages,
        ]);
    }

    /**
     * Store a newly created extension package.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'hours' => ['required', 'integer', 'min:1', 'max:720'],
            'price' => ['required', 'numeric', 'min:500'],
        ]);

        RoomExtensionPackage::create([
            'hours' => $validated['hours'],
            'price' => $validated['price'],
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Paket perpanjangan room berhasil ditambahkan!');
    }

    /**
     * Update the specified extension package.
     */
    public function update(Request $request, RoomExtensionPackage $package): RedirectResponse
    {
        $validated = $request->validate([
            'hours' => ['required', 'integer', 'min:1', 'max:720'],
            'price' => ['required', 'numeric', 'min:500'],
        ]);

        $package->update([
            'hours' => $validated['hours'],
            'price' => $validated['price'],
        ]);

        return redirect()->back()->with('success', 'Paket perpanjangan room berhasil diperbarui!');
    }

    /**
     * Toggle active status of an extension package.
     */
    public function toggleStatus(RoomExtensionPackage $package): RedirectResponse
    {
        $package->update([
            'is_active' => ! $package->is_active,
        ]);

        $statusText = $package->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Status paket perpanjangan berhasil {$statusText}!");
    }

    /**
     * Delete an extension package.
     */
    public function destroy(RoomExtensionPackage $package): RedirectResponse
    {
        $package->delete();

        return redirect()->back()->with('success', 'Paket perpanjangan room berhasil dihapus.');
    }
}
