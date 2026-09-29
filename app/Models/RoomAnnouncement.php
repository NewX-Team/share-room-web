<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $room_id
 * @property string $type
 * @property string $title
 * @property string $message
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class RoomAnnouncement extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'type',
        'title',
        'message',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
