<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomWalletPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'user_id',
        'payment_number',
        'payment_method',
        'recipient_name',
        'recipient_account',
        'bank_name',
        'qris_image_path',
        'amount',
        'notes',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the room associated with the payment.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the user who authorized the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
