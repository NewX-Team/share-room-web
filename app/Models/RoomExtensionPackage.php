<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomExtensionPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'hours',
        'price',
        'is_active',
    ];

    protected $casts = [
        'hours' => 'integer',
        'price' => 'float',
        'is_active' => 'boolean',
    ];
}
