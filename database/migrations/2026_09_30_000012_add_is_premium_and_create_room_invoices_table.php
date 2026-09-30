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
            $table->boolean('is_premium')->default(false)->after('freeze_reason');
        });

        Schema::create('room_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // member who bought it
            $table->string('invoice_number')->unique();
            $table->string('feature_name');
            $table->decimal('amount', 12, 2);
            $table->integer('duration_hours');
            $table->timestamp('paid_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_invoices');
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('is_premium');
        });
    }
};
