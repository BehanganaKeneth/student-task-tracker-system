<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'description',
        'due_date',
        'reminder_at',
        'status',
        'priority',
        'estimated_minutes',
        'recurrence',
        'recommended_start_date',
        'completed_at',
        'is_group_task',
        'group_name',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'reminder_at' => 'datetime',
            'recommended_start_date' => 'date',
            'completed_at' => 'datetime',
            'is_group_task' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the task.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this>
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Users this task is shared with.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<User>
     */
    public function sharedUsers(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<TaskSubtask, $this>
     */
    public function subtasks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TaskSubtask::class);
    }

    /**
     * Messages sent in the task chat.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<TaskMessage, $this>
     */
    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TaskMessage::class);
    }

    /**
     * Invitations sent for this group task.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<TaskGroupInvite, $this>
     */
    public function groupInvites(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TaskGroupInvite::class);
    }

    /**
     * Valid task statuses.
     *
     * @var list<string>
     */
    public const STATUSES = ['pending', 'in_progress', 'completed'];

    /**
     * Valid task priorities.
     *
     * @var list<string>
     */
    public const PRIORITIES = ['low', 'medium', 'high'];

    /**
     * Valid recurrence patterns.
     *
     * @var list<string>
     */
    public const RECURRENCES = ['none', 'daily', 'weekly'];
}
