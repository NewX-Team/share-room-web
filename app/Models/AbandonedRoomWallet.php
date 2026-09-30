<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbandonedRoomWallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_name',
        'room_code',
        'user_name',
        'amount',
        'expired_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expired_at' => 'datetime',
    ];
}
