<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $code
 * @property string $type
 * @property float $value
 * @property float $min_topup_amount
 * @property float|null $max_discount_amount
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $expires_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_topup_amount',
        'max_discount_amount',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'float',
            'min_topup_amount' => 'float',
            'max_discount_amount' => 'float',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Calculate discount amount for a given topup nominal.
     *
     * @return array{valid: bool, discount: float, pay_amount: float, message?: string}
     */
    public function calculateDiscount(float $topupAmount): array
    {
        if (! $this->is_active) {
            return [
                'valid' => false,
                'discount' => 0,
                'pay_amount' => $topupAmount,
                'message' => 'Kode promo ini sudah tidak aktif.',
            ];
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return [
                'valid' => false,
                'discount' => 0,
                'pay_amount' => $topupAmount,
                'message' => 'Kode promo ini sudah kadaluarsa.',
            ];
        }

        if ($topupAmount < $this->min_topup_amount) {
            return [
                'valid' => false,
                'discount' => 0,
                'pay_amount' => $topupAmount,
                'message' => 'Kode promo ini membutuhkan minimal top up Rp ' . number_format($this->min_topup_amount, 0, ',', '.') . '.',
            ];
        }

        $discount = 0.0;

        if ($this->type === 'percentage') {
            $discount = $topupAmount * ($this->value / 100);
            if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
                $discount = $this->max_discount_amount;
            }
        } else {
            // Fixed nominal discount
            $discount = min($this->value, $topupAmount);
        }

        $payAmount = max(0, $topupAmount - $discount);

        return [
            'valid' => true,
            'discount' => (float) $discount,
            'pay_amount' => (float) $payAmount,
            'message' => 'Kode promo berhasil digunakan!',
        ];
    }
}
