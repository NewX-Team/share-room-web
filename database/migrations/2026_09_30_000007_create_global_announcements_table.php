<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('global_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Admin author
            $table->string('title');
            $table->string('category')->default('info'); // update, maintenance, promo, alert, info
            $table->text('content');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed initial sample announcements from Admin (ID: 1)
        $adminUser = DB::table('users')->where('role', 'admin')->first();
        $adminId = $adminUser ? $adminUser->id : 1;

        DB::table('global_announcements')->insert([
            [
                'user_id' => $adminId,
                'title' => 'Selamat Datang di ShareRoom v2.0! 🎉',
                'category' => 'update',
                'content' => 'Fitur grup chat sementara, kas dompet digital room, dan sistem payment gateway Midtrans Sandbox kini telah aktif sepenuhnya. Selamat menikmati pengalaman obrolan instan bersama tim & teman kamu!',
                'is_pinned' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $adminId,
                'title' => 'Gunakan Kode Promo "HEMAT50" Saat Top Up 🎁',
                'category' => 'promo',
                'content' => 'Dapatkan diskon 50% untuk setiap pengisian saldo kas dompet room kamu! Cukup masukkan kode promo HEMAT50 pada modal top up saat transaksi.',
                'is_pinned' => false,
                'is_active' => true,
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('global_announcements');
    }
};
