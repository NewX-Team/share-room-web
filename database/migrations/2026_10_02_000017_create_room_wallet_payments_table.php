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
        Schema::create('room_wallet_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('payment_number')->unique();
            $table->string('payment_method')->default('qris'); // qris, virtual_account, bank_transfer, ewallet
            $table->string('recipient_name');
            $table->string('recipient_account')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('qris_image_path')->nullable();
            $table->decimal('amount', 15, 2);
            $table->text('notes')->nullable();
            $table->string('status')->default('success');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_wallet_payments');
    }
};
