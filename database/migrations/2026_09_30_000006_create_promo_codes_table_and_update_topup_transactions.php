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
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. HEMAT50, DISKON5K
            $table->string('type')->default('percentage'); // percentage or fixed
            $table->decimal('value', 15, 2); // e.g. 50 (for 50%) or 5000 (for Rp 5.000)
            $table->decimal('min_topup_amount', 15, 2)->default(0);
            $table->decimal('max_discount_amount', 15, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::table('topup_transactions', function (Blueprint $table) {
            $table->foreignId('promo_code_id')->nullable()->constrained('promo_codes')->onDelete('set null')->after('user_id');
            $table->decimal('discount_amount', 15, 2)->default(0)->after('gross_amount');
            $table->decimal('pay_amount', 15, 2)->default(0)->after('discount_amount');
        });

        // Seed default promo codes for testing
        DB::table('promo_codes')->insert([
            [
                'code' => 'HEMAT50',
                'type' => 'percentage',
                'value' => 50,
                'min_topup_amount' => 10000,
                'max_discount_amount' => 50000,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'DISKON5K',
                'type' => 'fixed',
                'value' => 5000,
                'min_topup_amount' => 10000,
                'max_discount_amount' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('topup_transactions', function (Blueprint $table) {
            $table->dropForeign(['promo_code_id']);
            $table->dropColumn(['promo_code_id', 'discount_amount', 'pay_amount']);
        });

        Schema::dropIfExists('promo_codes');
    }
};
