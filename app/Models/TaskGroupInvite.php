<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskGroupInvite extends Model
{
    /** @use HasFactory<\Database\Factories\TaskGroupInviteFactory> */
    use HasFactory;

    protected $fillable = [
        'task_id',
        'invited_by',
        'accepted_user_id',
        'email',
        'token',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
        ];
    }

    public function task(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
