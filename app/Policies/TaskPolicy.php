<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view the task.
     */
    public function view(User $user, Task $task): bool
    {
        return $task->user_id === $user->id
            || $user->role === 'admin'
            || $task->sharedUsers()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the task.
     */
    public function update(User $user, Task $task): bool
    {
        return $task->user_id === $user->id || in_array($user->role, ['admin', 'team_leader'], true);
    }

    /**
     * Determine whether the user can delete the task.
     */
    public function delete(User $user, Task $task): bool
    {
        return $task->user_id === $user->id || in_array($user->role, ['admin', 'team_leader'], true);
    }
}
