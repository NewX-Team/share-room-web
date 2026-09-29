<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromoCodeController extends Controller
{
    /**
     * Display a listing of all promo codes for Admin.
     */
    public function index(): Response
    {
        return Inertia::render('admin/promos/index', [
            'promos' => PromoCode::latest()->get(),
        ]);
    }

    /**
     * Store a newly created promo code.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:promo_codes,code'],
            'type' => ['required', 'string', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:1'],
            'min_topup_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
        ]);

        PromoCode::create([
            'code' => strtoupper(trim($validated['code'])),
            'type' => $validated['type'],
            'value' => (float) $validated['value'],
            'min_topup_amount' => (float) ($validated['min_topup_amount'] ?? 0),
            'max_discount_amount' => isset($validated['max_discount_amount']) ? (float) $validated['max_discount_amount'] : null,
            'is_active' => true,
            'expires_at' => ! empty($validated['expires_at']) ? $validated['expires_at'] : null,
        ]);

        return redirect()->back()->with('success', 'Kode Promo berhasil dibuat!');
    }

    /**
     * Toggle promo code active status.
     */
    public function toggleStatus(PromoCode $promo): RedirectResponse
    {
        $promo->update([
            'is_active' => ! $promo->is_active,
        ]);

        $statusStr = $promo->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Kode promo {$promo->code} berhasil {$statusStr}.");
    }

    /**
     * Remove specified promo code.
     */
    public function destroy(PromoCode $promo): RedirectResponse
    {
        $promo->delete();

        return redirect()->back()->with('success', 'Kode promo berhasil dihapus.');
    }
}
