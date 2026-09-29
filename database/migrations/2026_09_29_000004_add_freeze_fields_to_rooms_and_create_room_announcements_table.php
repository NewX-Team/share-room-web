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
        Schema::table('rooms', function (Blueprint $table) {
            $table->boolean('is_frozen')->default(false)->after('wallet_balance');
            $table->text('freeze_reason')->nullable()->after('is_frozen');
        });

        Schema::create('room_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->string('type')->default('info'); // add_funds, freeze, unfreeze
            $table->string('title');
            $table->text('message');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_announcements');

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['is_frozen', 'freeze_reason']);
        });
    }
};
