<?php

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('tasks.{task}', function (User $user, Task $task): bool {
    return $task->user_id === $user->id
        || $user->role === 'admin'
        || $task->sharedUsers()->where('users.id', $user->id)->exists();
});
