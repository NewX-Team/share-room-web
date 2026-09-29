<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $room_id
 * @property int $user_id
 * @property int|null $promo_code_id
 * @property string $order_id
 * @property float $gross_amount
 * @property float $discount_amount
 * @property float $pay_amount
 * @property string $status
 * @property string|null $snap_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class TopupTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'user_id',
        'promo_code_id',
        'order_id',
        'gross_amount',
        'discount_amount',
        'pay_amount',
        'status',
        'snap_token',
    ];

    protected function casts(): array
    {
        return [
            'gross_amount' => 'float',
            'discount_amount' => 'float',
            'pay_amount' => 'float',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class, 'promo_code_id');
    }
}
