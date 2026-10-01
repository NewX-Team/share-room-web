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
        Schema::create('room_extension_packages', function (Blueprint $table) {
            $table->id();
            $table->integer('hours');
            $table->decimal('price', 12, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed initial extension package options
        DB::table('room_extension_packages')->insert([
            ['hours' => 1, 'price' => 1000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['hours' => 3, 'price' => 2500, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['hours' => 6, 'price' => 5000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['hours' => 12, 'price' => 9000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['hours' => 24, 'price' => 15000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_extension_packages');
    }
};
