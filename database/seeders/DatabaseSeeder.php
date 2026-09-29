<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed default Admin User
        $admin = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin ShareRoom',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Seed default Regular User
        $user = User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('12345678'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        // Seed Sample Rooms created by users
        Room::updateOrCreate(
            ['code' => 'SR-8849'],
            [
                'user_id' => $user->id,
                'name' => 'Nongkrong Malam Minggu',
                'duration_hours' => 6,
                'expires_at' => now()->addHours(5),
                'wallet_balance' => 185000,
            ]
        );

        Room::updateOrCreate(
            ['code' => 'SR-3921'],
            [
                'user_id' => $user->id,
                'name' => 'Kas Futsal Komunitas',
                'duration_hours' => 24,
                'expires_at' => now()->addHours(18),
                'wallet_balance' => 420000,
            ]
        );
    }
}
