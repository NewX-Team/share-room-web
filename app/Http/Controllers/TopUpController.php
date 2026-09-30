<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use App\Models\Room;
use App\Models\RoomAnnouncement;
use App\Models\TopupTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TopUpController extends Controller
{
    /**
     * Verify a promo code for a given topup amount.
     */
    public function verifyPromo(Request $request, string $code): JsonResponse
    {
        $validated = $request->validate([
            'promo_code' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:10000'],
        ]);

        $promoInput = strtoupper(trim($validated['promo_code']));
        $amount = (float) $validated['amount'];

        $promo = PromoCode::where('code', $promoInput)->first();

        if (! $promo) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode promo tidak ditemukan.',
            ], 422);
        }

        $res = $promo->calculateDiscount($amount);

        if (! $res['valid']) {
            return response()->json($res, 422);
        }

        return response()->json([
            'valid' => true,
            'promo_id' => $promo->id,
            'code' => $promo->code,
            'type' => $promo->type,
            'value' => (float) $promo->value,
            'discount' => $res['discount'],
            'pay_amount' => $res['pay_amount'],
            'message' => $res['message'],
        ]);
    }

    /**
     * Create a Midtrans Snap Token for Room Top-Up.
     */
    public function createSnapToken(Request $request, string $code): JsonResponse
    {
        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();

        if ($room->is_frozen) {
            return response()->json([
                'error' => 'Dompet digital room sedang dibekukan oleh Admin. Tidak dapat melakukan top up saat ini.',
            ], 422);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:10000'],
            'promo_code' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $grossAmount = (float) $validated['amount']; // Credit added to room wallet
        $discountAmount = 0.0;
        $payAmount = $grossAmount; // Price paid by user
        $promoId = null;

        // Apply promo code if provided
        if (! empty($validated['promo_code'])) {
            $promoInput = strtoupper(trim($validated['promo_code']));
            $promo = PromoCode::where('code', $promoInput)->first();

            if ($promo) {
                $promoRes = $promo->calculateDiscount($grossAmount);
                if ($promoRes['valid']) {
                    $promoId = $promo->id;
                    $discountAmount = $promoRes['discount'];
                    $payAmount = $promoRes['pay_amount'];
                }
            }
        }

        $orderId = 'TOPUP-' . $room->code . '-' . rand(1000, 9999) . '-' . time();

        // Configure Midtrans PHP SDK
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = config('midtrans.is_3ds');

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $payAmount, // Actual payment amount via Midtrans
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
            'item_details' => [
                [
                    'id' => 'TOPUP-' . $room->code,
                    'price' => (int) $payAmount,
                    'quantity' => 1,
                    'name' => 'Top Up Kas Dompet Room ' . $room->name . ($discountAmount > 0 ? ' (Promo)' : ''),
                ],
            ],
        ];

        $snapToken = null;

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);
        } catch (\Exception $e) {
            Log::warning('Midtrans Snap Token generation error: ' . $e->getMessage());
            // Fallback token format for simulation testing when API keys are placeholder
            $snapToken = 'SIMULATOR-TOKEN-' . $orderId;
        }

        TopupTransaction::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'promo_code_id' => $promoId,
            'order_id' => $orderId,
            'gross_amount' => $grossAmount,
            'discount_amount' => $discountAmount,
            'pay_amount' => $payAmount,
            'status' => 'pending',
            'snap_token' => $snapToken,
        ]);

        return response()->json([
            'snap_token' => $snapToken,
            'order_id' => $orderId,
            'client_key' => config('midtrans.client_key'),
            'gross_amount' => $grossAmount,
            'discount_amount' => $discountAmount,
            'pay_amount' => $payAmount,
        ]);
    }

    /**
     * Finish top-up payment callback from client / simulator.
     */
    public function finishPayment(Request $request, string $code): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'order_id' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($code));
        $room = Room::where('code', $code)->firstOrFail();
        $user = $request->user();

        $transaction = TopupTransaction::with('promoCode')->where('order_id', $validated['order_id'])->first();

        if (! $transaction) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Transaksi tidak ditemukan.'], 404);
            }
            return redirect()->back()->with('error', 'Transaksi tidak ditemukan.');
        }

        if ($transaction->status !== 'settlement') {
            $transaction->update(['status' => 'settlement']);
            $room->increment('wallet_balance', $transaction->gross_amount);

            $promoText = $transaction->discount_amount > 0 && $transaction->promoCode
                ? " (Bayar: Rp " . number_format($transaction->pay_amount, 0, ',', '.') . " pake promo {$transaction->promoCode->code})"
                : '';

            // Add room announcement
            RoomAnnouncement::create([
                'room_id' => $room->id,
                'type' => 'add_funds',
                'title' => 'Top Up Saldo Kas Berhasil',
                'message' => "Pengguna {$user->name} berhasil Top Up saldo kas dompet room sebesar Rp " . number_format($transaction->gross_amount, 0, ',', '.') . "{$promoText} via Midtrans Sandbox.",
            ]);
        }

        $formattedGross = 'Rp ' . number_format($transaction->gross_amount, 0, ',', '.');
        $msg = "Top Up saldo kas dompet sebesar {$formattedGross} berhasil dilakukan!";

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $msg,
                'wallet_balance' => (float) $room->wallet_balance,
            ]);
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Handle Midtrans Webhook Notification Callback.
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');

        try {
            $notif = new \Midtrans\Notification();
            $transactionStatus = $notif->transaction_status;
            $orderId = $notif->order_id;
            $fraudStatus = $notif->fraud_status;

            $transaction = TopupTransaction::with('promoCode')->where('order_id', $orderId)->first();
            if (! $transaction) {
                return response()->json(['status' => 'not_found'], 404);
            }

            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'accept' && $transaction->status !== 'settlement') {
                    $this->markAsSettled($transaction);
                }
            } elseif ($transactionStatus == 'settlement' && $transaction->status !== 'settlement') {
                $this->markAsSettled($transaction);
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $transaction->update(['status' => 'failed']);
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            Log::error('Midtrans Webhook error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function markAsSettled(TopupTransaction $transaction): void
    {
        $transaction->update(['status' => 'settlement']);
        $room = $transaction->room;
        $user = $transaction->user;

        if ($room) {
            $room->increment('wallet_balance', $transaction->gross_amount);

            $promoText = $transaction->discount_amount > 0 && $transaction->promoCode
                ? " (Bayar: Rp " . number_format($transaction->pay_amount, 0, ',', '.') . " pake promo {$transaction->promoCode->code})"
                : '';

            RoomAnnouncement::create([
                'room_id' => $room->id,
                'type' => 'add_funds',
                'title' => 'Top Up Saldo Kas Berhasil',
                'message' => "Pengguna {$user->name} berhasil Top Up saldo kas dompet room sebesar Rp " . number_format($transaction->gross_amount, 0, ',', '.') . "{$promoText} via Midtrans Sandbox.",
            ]);
        }
    }
}
