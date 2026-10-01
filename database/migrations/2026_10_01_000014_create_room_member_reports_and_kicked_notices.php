<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_member_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('reported_id')->constrained('users')->onDelete('cascade');
            $table->string('reason_category');
            $table->text('description');
            $table->string('status')->default('pending'); // 'pending', 'dismissed', 'actioned_kick'
            $table->timestamps();
        });

        Schema::create('kicked_room_notices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('set null');
            $table->string('room_name');
            $table->string('room_code');
            $table->string('reason');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kicked_room_notices');
        Schema::dropIfExists('room_member_reports');
    }
};
