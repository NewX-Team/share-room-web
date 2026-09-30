<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $code
 * @property int $duration_hours
 * @property Carbon $expires_at
 * @property float $wallet_balance
 * @property bool $is_frozen
 * @property string|null $freeze_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'code',
        'type',
        'duration_hours',
        'expires_at',
        'wallet_balance',
        'is_frozen',
        'freeze_reason',
        'is_premium',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'wallet_balance' => 'float',
            'duration_hours' => 'integer',
            'is_frozen' => 'boolean',
            'is_premium' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the room.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get members in the room.
     */
    public function members(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RoomMember::class);
    }

    /**
     * Get chat messages in the room.
     */
    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get announcements for the room.
     */
    public function announcements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RoomAnnouncement::class);
    }

    /**
     * Get join requests for the room.
     */
    public function joinRequests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RoomJoinRequest::class);
    }

    /**
     * Get invoices for the room.
     */
    public function invoices(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RoomInvoice::class);
    }

    /**
     * Calculate room premium price based on duration hours.
     * Base (1 hr) = Rp 2.000, each additional hr = Rp 500.
     */
    public function calculatePremiumPrice(): int
    {
        return 2000 + max(0, (int) $this->duration_hours - 1) * 500;
    }

    /**
     * Check if the room duration has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if room is private.
     */
    public function isPrivate(): bool
    {
        return $this->type === 'private';
    }
}
