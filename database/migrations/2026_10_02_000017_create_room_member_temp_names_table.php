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
        Schema::create('room_member_temp_names', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_member_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->timestamps();

            $table->unique('room_member_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temp_names');
    }
};
