<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root based on authentication status
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Welcome');
});

Route::get('/group-invites/{token}', [TaskController::class, 'showGroupInvite'])
    ->name('group-invites.show');

// Protected routes (only for logged-in & verified users)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [TaskController::class, 'index'])->name('dashboard');
    Route::get('/admin/approvals', [TaskController::class, 'approvals'])->name('admin.approvals.index');
    Route::get('/tasks/calendar', [TaskController::class, 'calendar'])->name('tasks.calendar');
    Route::get('/tasks/calendar/export', [TaskController::class, 'calendarExport'])->name('tasks.calendar.export');
    Route::post('/tasks/quick', [TaskController::class, 'quickStore'])->name('tasks.quick-store');
    Route::post('/study-sessions', [TaskController::class, 'storeSession'])->name('study-sessions.store');
    Route::post('/admin/approvals/{user}', [TaskController::class, 'approveAdmin'])
        ->name('admin.approvals.approve');
    Route::get('/tasks/{task}/discussion', [TaskController::class, 'discussion'])->name('tasks.discussion');
    Route::post('/tasks/{task}/messages', [TaskController::class, 'storeMessage'])->name('tasks.messages.store');

    Route::post('/tasks/{task}/subtasks', [TaskController::class, 'storeSubtask'])->name('tasks.subtasks.store');
    Route::patch('/tasks/{task}/subtasks/{subtask}/toggle', [TaskController::class, 'toggleSubtask'])
        ->name('tasks.subtasks.toggle');
    Route::delete('/tasks/{task}/subtasks/{subtask}', [TaskController::class, 'destroySubtask'])
        ->name('tasks.subtasks.destroy');

    Route::resource('tasks', TaskController::class)->except(['index', 'show']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Authentication routes (login, register, etc.)
require __DIR__.'/auth.php';
