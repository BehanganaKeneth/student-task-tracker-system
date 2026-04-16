<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class StarterTasksSeeder extends Seeder
{
    /**
     * Seed starter tasks for users without tasks.
     */
    public function run(): void
    {
        User::query()
            ->doesntHave('tasks')
            ->get()
            ->each(function (User $user): void {
                Task::insert([
                    [
                        'user_id' => $user->id,
                        'title' => 'Complete your profile',
                        'description' => 'Add profile details and verify your email.',
                        'status' => 'pending',
                        'due_date' => now()->addDay()->toDateString(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'user_id' => $user->id,
                        'title' => 'Create your first task',
                        'description' => 'Use the Add Task button to add your own task.',
                        'status' => 'in_progress',
                        'due_date' => now()->addDays(3)->toDateString(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'user_id' => $user->id,
                        'title' => 'Mark a task as completed',
                        'description' => 'Try checking off a task from your dashboard.',
                        'status' => 'completed',
                        'due_date' => now()->toDateString(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);
            });
    }
}
