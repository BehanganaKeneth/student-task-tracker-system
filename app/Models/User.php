<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'admin_requested_at',
        'admin_approved_at',
        'admin_approved_by',
        'study_hours_per_day',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'admin_requested_at' => 'datetime',
            'admin_approved_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the tasks for the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Task, $this>
     */
    public function tasks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Tasks shared with this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Task>
     */
    public function sharedTasks(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Task::class)->withTimestamps();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<StudySession, $this>
     */
    public function studySessions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StudySession::class);
    }

    /**
     * Valid user roles.
     *
     * @var list<string>
     */
    public const ROLES = ['admin', 'student'];

    public function canApproveAdmins(): bool
    {
        $approverEmail = (string) config('services.admin.approver_email');

        return $approverEmail !== '' && strcasecmp($this->email, $approverEmail) === 0;
    }

    public function isAdminApproved(): bool
    {
        return $this->role !== 'admin' || $this->admin_approved_at !== null;
    }
}
