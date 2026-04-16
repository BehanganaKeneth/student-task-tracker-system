<?php

namespace App\Events;

use App\Models\TaskMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public TaskMessage $message)
    {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('tasks.'.$this->message->task_id)];
    }

    public function broadcastAs(): string
    {
        return 'TaskMessageCreated';
    }

    public function broadcastWith(): array
    {
        $user = $this->message->user;

        return [
            'id' => $this->message->id,
            'task_id' => $this->message->task_id,
            'user_id' => $this->message->user_id,
            'message' => $this->message->message,
            'created_at' => $this->message->created_at?->toIso8601String(),
            'user' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'role' => $user?->role,
            ],
        ];
    }
}
