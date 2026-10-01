<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $room_id
 * @property int $user_id
 * @property string $role_in_room
 */
class RoomMemberTempName extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_member_id',
        'name',
    ];

    public function room_member(): BelongsTo
    {
        return $this->belongsTo(RoomMember::class);
    }
}
