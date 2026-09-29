<?php

use App\Http\Controllers\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Admin\PromoCodeController as AdminPromoCodeController;
use App\Http\Controllers\Admin\RoomController as AdminRoomController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TopUpController;
use App\Http\Controllers\UserRoomController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::post('midtrans/webhook', [TopUpController::class, 'handleWebhook'])->name('midtrans.webhook');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // User Room Routes
    Route::post('rooms', [UserRoomController::class, 'store'])->name('rooms.store');
    Route::post('rooms/join', [UserRoomController::class, 'join'])->name('rooms.join');
    Route::get('rooms/{code}', [UserRoomController::class, 'show'])->name('rooms.show');
    Route::post('rooms/{code}/messages', [UserRoomController::class, 'sendMessage'])->name('rooms.messages.store');
    Route::post('rooms/{code}/members/{member}/role', [UserRoomController::class, 'updateMemberRole'])->name('rooms.members.role');
    Route::post('rooms/{code}/members/{member}/kick', [UserRoomController::class, 'kickMember'])->name('rooms.members.kick');
    Route::post('rooms/{code}/leave', [UserRoomController::class, 'leave'])->name('rooms.leave');
    Route::delete('rooms/{room}/history', [UserRoomController::class, 'removeHistory'])->name('rooms.history.remove');

    // Room Top Up Routes (Midtrans Sandbox)
    Route::post('rooms/{code}/topup/verify-promo', [TopUpController::class, 'verifyPromo'])->name('rooms.topup.verify-promo');
    Route::post('rooms/{code}/topup/token', [TopUpController::class, 'createSnapToken'])->name('rooms.topup.token');
    Route::post('rooms/{code}/topup/finish', [TopUpController::class, 'finishPayment'])->name('rooms.topup.finish');

    // Global Announcements Route for Regular Users
    Route::get('announcements', [AnnouncementController::class, 'index'])->name('announcements.index');

    // Protected Admin Routes
    Route::middleware([EnsureUserIsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
        Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

        Route::get('rooms', [AdminRoomController::class, 'index'])->name('rooms.index');
        Route::post('rooms/{room}/add-funds', [AdminRoomController::class, 'addFunds'])->name('rooms.add-funds');
        Route::post('rooms/{room}/freeze', [AdminRoomController::class, 'freezeWallet'])->name('rooms.freeze');
        Route::post('rooms/{room}/unfreeze', [AdminRoomController::class, 'unfreezeWallet'])->name('rooms.unfreeze');
        Route::delete('rooms/{room}', [AdminRoomController::class, 'destroy'])->name('rooms.destroy');

        // Admin Promo Code Routes
        Route::get('promos', [AdminPromoCodeController::class, 'index'])->name('promos.index');
        Route::post('promos', [AdminPromoCodeController::class, 'store'])->name('promos.store');
        Route::post('promos/{promo}/toggle', [AdminPromoCodeController::class, 'toggleStatus'])->name('promos.toggle');
        Route::delete('promos/{promo}', [AdminPromoCodeController::class, 'destroy'])->name('promos.destroy');

        // Admin Announcement Routes
        Route::get('announcements', [AdminAnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('announcements', [AdminAnnouncementController::class, 'store'])->name('announcements.store');
        Route::post('announcements/{announcement}/toggle-status', [AdminAnnouncementController::class, 'toggleStatus'])->name('announcements.toggle-status');
        Route::post('announcements/{announcement}/toggle-pin', [AdminAnnouncementController::class, 'togglePin'])->name('announcements.toggle-pin');
        Route::delete('announcements/{announcement}', [AdminAnnouncementController::class, 'destroy'])->name('announcements.destroy');
    });
});

require __DIR__.'/settings.php';
