<?php

namespace App\Http\Controllers;

use App\Events\TaskMessageCreated;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Mail\AdminApproved;
use App\Mail\GroupTaskInvitation;
use App\Models\StudySession;
use App\Models\TaskGroupInvite;
use App\Models\TaskMessage;
use App\Models\Task;
use App\Models\TaskSubtask;
use App\Models\User;
use App\Notifications\TaskActivityNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TaskController extends Controller
{
    /**
     * Display the dashboard with the authenticated user's tasks.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $tasks = Task::query()
            ->with(['user:id,name,email,role', 'sharedUsers:id,name,email,role', 'groupInvites:id,task_id,email,accepted_at', 'subtasks:id,task_id,title,is_completed'])
            ->withCount('messages')
            ->where(function ($query) use ($user) {
                $query
                    ->where('user_id', $user->id)
                    ->orWhereHas('sharedUsers', fn ($sharedQuery) => $sharedQuery->where('users.id', $user->id));
            })
            ->orderByRaw("CASE status WHEN 'in_progress' THEN 1 WHEN 'pending' THEN 2 WHEN 'completed' THEN 3 ELSE 4 END")
            ->orderBy('due_date')
            ->get();

        $recommended = $tasks
            ->where('status', '!=', 'completed')
            ->map(function (Task $task) use ($user) {
                $daysLeft = $task->due_date ? max(0, now()->startOfDay()->diffInDays($task->due_date, false)) : 14;
                $priorityWeight = $task->priority === 'high' ? 30 : ($task->priority === 'medium' ? 20 : 10);
                $urgencyWeight = max(0, 40 - ($daysLeft * 4));
                $effortWeight = (int) min(20, ceil(($task->estimated_minutes ?? 60) / 30));
                $score = $priorityWeight + $urgencyWeight + $effortWeight;

                return [
                    'task_id' => $task->id,
                    'title' => $task->title,
                    'score' => $score,
                    'reason' => $daysLeft <= 2
                        ? 'Due very soon with high urgency.'
                        : 'Good next task based on priority and effort.',
                ];
            })
            ->sortByDesc('score')
            ->take(5)
            ->values();

        $weeklyPlan = $this->buildWeeklyPlan($tasks, (int) $user->study_hours_per_day);

        $overdueTasks = $tasks->filter(function (Task $task) {
            return $task->status !== 'completed' && $task->due_date && $task->due_date->isBefore(now()->startOfDay());
        });

        $dueTodayTasks = $tasks->filter(function (Task $task) {
            return $task->status !== 'completed' && $task->due_date && $task->due_date->isToday();
        });

        $activeReminderTasks = $tasks->filter(function (Task $task) {
            return $task->status !== 'completed' && $task->reminder_at && $task->reminder_at->isPast();
        });

        $completedThisWeek = $tasks->filter(function (Task $task) {
            return $task->completed_at && $task->completed_at->greaterThanOrEqualTo(now()->startOfWeek());
        })->count();

        $completedCount = $tasks->where('status', 'completed')->count();
        $totalCount = max($tasks->count(), 1);
        $completionRate = (int) round(($completedCount / $totalCount) * 100);

        $insights = [
            'completion_rate' => $completionRate,
            'completed_this_week' => $completedThisWeek,
            'overdue_count' => $overdueTasks->count(),
            'focus_tip' => $completionRate >= 70
                ? 'Great momentum. Keep prioritizing high-impact tasks first.'
                : 'Try finishing one in-progress task today to improve momentum.',
        ];

        $notifications = collect()
            ->merge($overdueTasks->map(fn (Task $task) => [
                'type' => 'overdue',
                'message' => "Overdue: {$task->title}",
                'task_id' => $task->id,
            ]))
            ->merge($dueTodayTasks->map(fn (Task $task) => [
                'type' => 'due_today',
                'message' => "Due today: {$task->title}",
                'task_id' => $task->id,
            ]))
            ->merge($activeReminderTasks->map(fn (Task $task) => [
                'type' => 'reminder',
                'message' => "Reminder: {$task->title}",
                'task_id' => $task->id,
            ]))
            ->merge($tasks->where('status', '!=', 'completed')->filter(function (Task $task) use ($user) {
                if (!$task->due_date || !$task->estimated_minutes) {
                    return false;
                }

                $daysLeft = max(1, now()->startOfDay()->diffInDays($task->due_date, false));
                $availableMinutes = $daysLeft * (int) $user->study_hours_per_day * 60;

                return $task->estimated_minutes > $availableMinutes;
            })->map(fn (Task $task) => [
                'type' => 'risk',
                'message' => "Risk alert: {$task->title} may miss deadline based on available study hours.",
                'task_id' => $task->id,
            ]))
            ->take(12)
            ->values();

        $weeklyStudyMinutes = StudySession::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->startOfWeek())
            ->sum('minutes');

        $pendingAdminApprovals = $user->canApproveAdmins()
            ? User::query()
                ->where('role', 'admin')
                ->whereNull('admin_approved_at')
                ->orderByDesc('admin_requested_at')
                ->get(['id', 'name', 'email', 'admin_requested_at'])
                ->values()
            : collect();

        return Inertia::render('Dashboard', [
            'tasks' => $tasks->map(function (Task $task) use ($user) {
                return [
                    ...$task->toArray(),
                    'owner_name' => $task->user?->name,
                    'is_owner' => $task->user_id === $user->id,
                    'shared_users' => $task->sharedUsers->map(fn (User $sharedUser) => [
                        'id' => $sharedUser->id,
                        'name' => $sharedUser->name,
                        'email' => $sharedUser->email,
                        'role' => $sharedUser->role,
                    ])->values(),
                    'group_member_emails' => $task->groupInvites->pluck('email')->values(),
                    'pending_group_invites' => $task->groupInvites->whereNull('accepted_at')->pluck('email')->values(),
                    'messages_count' => $task->messages_count,
                    'subtasks' => $task->subtasks->values(),
                ];
            })->values(),
            'analytics' => [
                'status_counts' => [
                    'pending' => $tasks->where('status', 'pending')->count(),
                    'in_progress' => $tasks->where('status', 'in_progress')->count(),
                    'completed' => $completedCount,
                ],
                'priority_counts' => [
                    'low' => $tasks->where('priority', 'low')->count(),
                    'medium' => $tasks->where('priority', 'medium')->count(),
                    'high' => $tasks->where('priority', 'high')->count(),
                ],
                'insights' => $insights,
            ],
            'notifications' => $notifications,
            'recommendations' => $recommended,
            'weeklyPlan' => $weeklyPlan,
            'studyStats' => [
                'weekly_minutes' => $weeklyStudyMinutes,
                'weekly_hours' => round($weeklyStudyMinutes / 60, 1),
                'target_hours' => (int) $user->study_hours_per_day * 7,
            ],
            'pendingAdminApprovals' => $pendingAdminApprovals,
        ]);
    }

    /**
     * Show the pending admin approvals page.
     */
    public function approvals(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->canApproveAdmins(), 403);

        $pendingAdminApprovals = User::query()
            ->where('role', 'admin')
            ->whereNull('admin_approved_at')
            ->orderByDesc('admin_requested_at')
            ->get(['id', 'name', 'email', 'admin_requested_at'])
            ->values();

        return Inertia::render('Admin/Approvals', [
            'pendingAdminApprovals' => $pendingAdminApprovals,
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create(): Response
    {
        return Inertia::render('Tasks/Create', [
            'shareableUsers' => User::query()
                ->where('id', '!=', auth()->id())
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role']),
        ]);
    }

    /**
     * Store a newly created task in storage.
     */
    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $sharedUserIds = collect($validated['shared_user_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->reject(fn (int $id) => $id === $request->user()->id)
            ->unique()
            ->values()
            ->all();

        unset($validated['shared_user_ids']);

        $groupMemberEmails = collect($validated['group_member_emails'] ?? [])
            ->map(fn ($email) => Str::lower(trim((string) $email)))
            ->filter()
            ->unique()
            ->reject(fn (string $email) => $email === Str::lower($request->user()->email))
            ->values();

        unset($validated['group_member_emails']);

        $validated['is_group_task'] = (bool) ($validated['is_group_task'] ?? false);
        $validated['group_name'] = $validated['is_group_task'] ? ($validated['group_name'] ?? null) : null;
        $validated['completed_at'] = ($validated['status'] ?? 'pending') === 'completed' ? now() : null;
        $validated['recommended_start_date'] = $this->calculateRecommendedStartDate(
            $validated['due_date'] ?? null,
            $validated['estimated_minutes'] ?? null,
            (int) $request->user()->study_hours_per_day,
        );

        $task = $request->user()->tasks()->create($validated);

        if ($validated['is_group_task']) {
            $this->syncGroupInvitations($task, $groupMemberEmails->all(), $request->user());
        } else {
            $task->sharedUsers()->sync($sharedUserIds);

            $this->notifyTaskParticipants(
                $task,
                $request->user(),
                'Task shared',
                "{$request->user()->name} shared task: {$task->title}",
                route('tasks.edit', $task),
            );
        }

        return redirect()->route('dashboard')->with('success', 'Task created successfully.');
    }

    /**
     * Show the form for editing the specified task.
     */
    public function edit(Task $task): Response
    {
        $this->authorize('update', $task);

        $task->load(['sharedUsers:id,name,email,role', 'groupInvites:id,task_id,email,accepted_at']);

        return Inertia::render('Tasks/Edit', [
            'task' => [
                ...$task->toArray(),
                'shared_user_ids' => $task->sharedUsers->pluck('id')->values(),
                'group_member_emails' => $task->groupInvites->pluck('email')->values(),
            ],
            'shareableUsers' => User::query()
                ->where('id', '!=', auth()->id())
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role']),
        ]);
    }

    /**
     * Show the task discussion page.
     */
    public function discussion(Request $request, Task $task): Response
    {
        $this->authorize('view', $task);

        $task->load(['sharedUsers:id,name,email,role', 'user:id,name,email,role']);
        $messages = TaskMessage::query()
            ->with('user:id,name,email,role')
            ->where('task_id', $task->id)
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Tasks/Discussion', [
            'task' => [
                ...$task->toArray(),
                'owner_name' => $task->user?->name,
                'is_owner' => $task->user_id === $request->user()->id,
                'shared_users' => $task->sharedUsers->map(fn (User $sharedUser) => [
                    'id' => $sharedUser->id,
                    'name' => $sharedUser->name,
                    'email' => $sharedUser->email,
                    'role' => $sharedUser->role,
                ])->values(),
            ],
            'messages' => $messages->map(fn (TaskMessage $message) => [
                'id' => $message->id,
                'message' => $message->message,
                'created_at' => $message->created_at->toIso8601String(),
                'user' => [
                    'id' => $message->user->id,
                    'name' => $message->user->name,
                    'email' => $message->user->email,
                    'role' => $message->user->role,
                ],
                'is_current_user' => $message->user_id === $request->user()->id,
            ])->values(),
        ]);
    }

    /**
     * Update the specified task in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validated();
        $sharedUserIds = collect($validated['shared_user_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->reject(fn (int $id) => $id === $task->user_id)
            ->unique()
            ->values()
            ->all();

        unset($validated['shared_user_ids']);

        $groupMemberEmails = collect($validated['group_member_emails'] ?? [])
            ->map(fn ($email) => Str::lower(trim((string) $email)))
            ->filter()
            ->unique()
            ->reject(fn (string $email) => $email === Str::lower($task->user?->email ?? ''))
            ->values();

        unset($validated['group_member_emails']);

        $validated['is_group_task'] = (bool) ($validated['is_group_task'] ?? false);
        $validated['group_name'] = $validated['is_group_task'] ? ($validated['group_name'] ?? null) : null;
        $validated['recommended_start_date'] = $this->calculateRecommendedStartDate(
            $validated['due_date'] ?? null,
            $validated['estimated_minutes'] ?? null,
            (int) $request->user()->study_hours_per_day,
        );

        $wasCompleted = $task->status === 'completed';

        if (($validated['status'] ?? $task->status) === 'completed' && !$task->completed_at) {
            $validated['completed_at'] = now();
        }

        if (($validated['status'] ?? $task->status) !== 'completed') {
            $validated['completed_at'] = null;
        }

        $task->update($validated);
        if ($validated['is_group_task']) {
            $this->syncGroupInvitations($task, $groupMemberEmails->all(), $request->user());
        } else {
            $task->sharedUsers()->sync($sharedUserIds);

            $this->notifyTaskParticipants(
                $task,
                $request->user(),
                'Task updated',
                "{$request->user()->name} updated task: {$task->title}",
                route('tasks.edit', $task),
            );
        }

        if (!$wasCompleted && $task->status === 'completed') {
            $this->createNextRecurringTask($task);
        }

        return redirect()->route('dashboard')->with('success', 'Task updated successfully.');
    }

    /**
     * Store a new message in the task discussion.
     */
    public function storeMessage(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('view', $task);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $message = $task->messages()->create([
            'user_id' => $request->user()->id,
            'message' => trim($data['message']),
        ]);

        $message->load('user:id,name,email,role');
        event(new TaskMessageCreated($message));

        $this->notifyTaskParticipants(
            $task,
            $request->user(),
            'New task message',
            trim($data['message']),
            route('tasks.discussion', $task),
        );

        return redirect()->route('tasks.discussion', $task)->with('success', 'Message sent.');
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()->route('dashboard')->with('success', 'Task deleted successfully.');
    }

    /**
     * Quick capture endpoint for fast task creation.
     */
    public function quickStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->tasks()->create([
            'title' => $data['title'],
            'status' => 'pending',
            'priority' => 'medium',
            'recurrence' => 'none',
        ]);

        return redirect()->route('dashboard')->with('success', 'Task captured successfully.');
    }

    /**
     * Add a subtask to a task.
     */
    public function storeSubtask(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $task->subtasks()->create($data);

        return redirect()->route('dashboard')->with('success', 'Subtask added.');
    }

    /**
     * Toggle subtask completion.
     */
    public function toggleSubtask(Task $task, TaskSubtask $subtask): RedirectResponse
    {
        $this->authorize('update', $task);

        abort_unless($subtask->task_id === $task->id, 404);

        $subtask->update(['is_completed' => !$subtask->is_completed]);

        return redirect()->route('dashboard');
    }

    /**
     * Delete a subtask.
     */
    public function destroySubtask(Task $task, TaskSubtask $subtask): RedirectResponse
    {
        $this->authorize('update', $task);

        abort_unless($subtask->task_id === $task->id, 404);

        $subtask->delete();

        return redirect()->route('dashboard')->with('success', 'Subtask removed.');
    }

    /**
     * Save a focus/study session.
     */
    public function storeSession(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'minutes' => ['required', 'integer', 'min:1', 'max:600'],
            'session_started_at' => ['nullable', 'date'],
            'session_ended_at' => ['nullable', 'date'],
        ]);

        if (!empty($data['task_id'])) {
            $task = Task::find($data['task_id']);
            if ($task && $task->user_id !== $request->user()->id && !$task->sharedUsers()->where('users.id', $request->user()->id)->exists()) {
                abort(403);
            }
        }

        $request->user()->studySessions()->create($data);

        return redirect()->route('dashboard')->with('success', 'Study session saved.');
    }

    /**
     * Approve a pending admin account.
     */
    public function approveAdmin(Request $request, User $user): RedirectResponse
    {
        if (!$request->user()->canApproveAdmins()) {
            abort(403);
        }

        if ($user->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'Only admin accounts can be approved.');
        }

        if ($user->admin_approved_at) {
            return redirect()->route('dashboard')->with('success', 'Admin account is already approved.');
        }

        $user->update([
            'admin_approved_at' => now(),
            'admin_approved_by' => $request->user()->email,
        ]);

        try {
            Mail::to($user->email)->send(new AdminApproved($user, $request->user()->email));
        } catch (Throwable $e) {
            report($e);
        }

        return redirect()->route('dashboard')->with('success', "Approved admin account for {$user->name}.");
    }

    /**
     * Show a labeled calendar page with task statuses.
     */
    public function calendar(Request $request): Response
    {
        $user = $request->user();

        $tasks = Task::query()
            ->where(function ($query) use ($user) {
                $query
                    ->where('user_id', $user->id)
                    ->orWhereHas('sharedUsers', fn ($sharedQuery) => $sharedQuery->where('users.id', $user->id));
            })
            ->whereNotNull('due_date')
            ->orderBy('due_date')
            ->get(['id', 'title', 'status', 'priority', 'due_date']);

        $today = now()->startOfDay();

        $overdue = $tasks
            ->filter(fn (Task $task) => $task->status !== 'completed' && $task->due_date && $task->due_date->lt($today))
            ->values();

        $incoming = $tasks
            ->filter(fn (Task $task) => $task->status !== 'completed' && $task->due_date && $task->due_date->gte($today))
            ->values();

        $pending = $tasks
            ->filter(fn (Task $task) => in_array($task->status, ['pending', 'in_progress'], true))
            ->values();

        $completed = $tasks
            ->filter(fn (Task $task) => $task->status === 'completed')
            ->values();

        return Inertia::render('Tasks/Calendar', [
            'tasks' => $tasks->values(),
            'labels' => [
                'pending' => $pending->count(),
                'incoming' => $incoming->count(),
                'overdue' => $overdue->count(),
                'completed' => $completed->count(),
            ],
            'sections' => [
                'pending' => $pending->values(),
                'incoming' => $incoming->values(),
                'overdue' => $overdue->values(),
                'completed' => $completed->values(),
            ],
            'today' => $today->toDateString(),
        ]);
    }

    /**
     * Export tasks as an ICS calendar file.
     */
    public function calendarExport(Request $request): HttpResponse
    {
        $user = $request->user();

        $tasks = Task::query()
            ->where(function ($query) use ($user) {
                $query
                    ->where('user_id', $user->id)
                    ->orWhereHas('sharedUsers', fn ($sharedQuery) => $sharedQuery->where('users.id', $user->id));
            })
            ->whereNotNull('due_date')
            ->get(['id', 'title', 'description', 'due_date']);

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Student Task Tracker//EN',
        ];

        foreach ($tasks as $task) {
            $start = Carbon::parse($task->due_date)->format('Ymd');
            $end = Carbon::parse($task->due_date)->addDay()->format('Ymd');
            $summary = str_replace(["\n", "\r", ','], [' ', ' ', '\\,'], $task->title);
            $description = str_replace(["\n", "\r", ','], [' ', ' ', '\\,'], (string) $task->description);

            $lines[] = 'BEGIN:VEVENT';
            $lines[] = "UID:task-{$task->id}@student-task-tracker";
            $lines[] = 'DTSTAMP:'.now()->utc()->format('Ymd\\THis\\Z');
            $lines[] = "DTSTART;VALUE=DATE:{$start}";
            $lines[] = "DTEND;VALUE=DATE:{$end}";
            $lines[] = "SUMMARY:{$summary}";
            $lines[] = "DESCRIPTION:{$description}";
            $lines[] = 'END:VEVENT';
        }

        $lines[] = 'END:VCALENDAR';

        $content = implode("\r\n", $lines)."\r\n";

        return response($content, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="student-tasks.ics"',
        ]);
    }

    /**
     * Show a pending group invitation page.
     */
    public function showGroupInvite(Request $request, string $token): Response|RedirectResponse
    {
        $invite = TaskGroupInvite::query()
            ->with('task:id,title,group_name,user_id')
            ->where('token', $token)
            ->firstOrFail();

        if ($request->user()) {
            return $this->acceptGroupInvite($request, $invite);
        }

        $request->session()->put('group_invite_token', $token);

        return Inertia::render('GroupInvites/Show', [
            'invite' => [
                'email' => $invite->email,
                'task_title' => $invite->task->title,
                'group_name' => $invite->task->group_name,
            ],
            'canRegister' => true,
        ]);
    }

    /**
     * Accept a stored invite for the current authenticated user.
     */
    public function acceptGroupInvite(Request $request, ?TaskGroupInvite $invite = null): RedirectResponse
    {
        $token = $invite?->token ?? $request->session()->pull('group_invite_token');

        if (!$token) {
            return redirect()->route('dashboard')->with('error', 'No pending group invitation found.');
        }

        $invite ??= TaskGroupInvite::query()->with('task')->where('token', $token)->firstOrFail();

        if (Str::lower($request->user()->email) !== Str::lower($invite->email)) {
            return redirect()->route('dashboard')->with('error', 'Use the invited email address to join this group.');
        }

        if (!$invite->accepted_at) {
            $invite->task->sharedUsers()->syncWithoutDetaching([$request->user()->id]);
            $invite->update([
                'accepted_at' => now(),
                'accepted_user_id' => $request->user()->id,
            ]);
        }

        return redirect()->route('tasks.edit', $invite->task_id)->with('success', 'You have joined the group task.');
    }

    private function calculateRecommendedStartDate(?string $dueDate, ?int $estimatedMinutes, int $studyHoursPerDay): ?string
    {
        if (!$dueDate || !$estimatedMinutes || $estimatedMinutes <= 0) {
            return null;
        }

        $capacityPerDay = max(30, $studyHoursPerDay * 60);
        $requiredDays = (int) ceil($estimatedMinutes / $capacityPerDay);

        return Carbon::parse($dueDate)->subDays($requiredDays)->toDateString();
    }

    private function createNextRecurringTask(Task $task): void
    {
        if ($task->recurrence === 'none') {
            return;
        }

        $nextDueDate = $task->due_date
            ? ($task->recurrence === 'daily' ? $task->due_date->copy()->addDay() : $task->due_date->copy()->addWeek())
            : null;

        $newTask = Task::create([
            'user_id' => $task->user_id,
            'title' => $task->title,
            'description' => $task->description,
            'due_date' => $nextDueDate,
            'reminder_at' => null,
            'status' => 'pending',
            'priority' => $task->priority,
            'estimated_minutes' => $task->estimated_minutes,
            'recurrence' => $task->recurrence,
            'recommended_start_date' => $this->calculateRecommendedStartDate(
                $nextDueDate?->toDateString(),
                $task->estimated_minutes,
                2,
            ),
            'completed_at' => null,
            'is_group_task' => $task->is_group_task,
            'group_name' => $task->group_name,
        ]);

        $newTask->sharedUsers()->sync($task->sharedUsers()->pluck('users.id')->all());
    }

    /**
     * Create or refresh email invitations for a group task.
     *
     * @param array<int, string> $emails
     */
    private function syncGroupInvitations(Task $task, array $emails, User $inviter): void
    {
        foreach ($emails as $email) {
            $invite = TaskGroupInvite::firstOrCreate(
                [
                    'task_id' => $task->id,
                    'email' => $email,
                ],
                [
                    'invited_by' => $inviter->id,
                    'token' => (string) Str::uuid(),
                ],
            );

            if (!$invite->accepted_at) {
                $invite->update(['invited_by' => $inviter->id]);

                try {
                    Mail::to($email)->send(new GroupTaskInvitation($task, $invite));
                } catch (Throwable $e) {
                    report($e);
                }
            }
        }
    }

    private function notifyTaskParticipants(Task $task, User $actor, string $title, string $message, ?string $link = null): void
    {
        $participants = $task->sharedUsers()
            ->where('users.id', '!=', $actor->id)
            ->get();

        if ($participants->isEmpty()) {
            return;
        }

        Notification::send(
            $participants,
            new TaskActivityNotification($title, $message, $link, $task->id),
        );
    }

    private function buildWeeklyPlan($tasks, int $studyHoursPerDay): array
    {
        $capacityPerDay = max(60, $studyHoursPerDay * 60);
        $days = collect(range(0, 6))->map(function ($offset) use ($capacityPerDay) {
            $date = now()->startOfDay()->addDays($offset);

            return [
                'date' => $date->toDateString(),
                'label' => $date->format('D, M j'),
                'capacity_minutes' => $capacityPerDay,
                'planned_minutes' => 0,
                'tasks' => [],
            ];
        })->values()->all();

        $openTasks = $tasks
            ->where('status', '!=', 'completed')
            ->sortBy(fn (Task $task) => $task->due_date?->timestamp ?? PHP_INT_MAX)
            ->values();

        foreach ($openTasks as $task) {
            $minutes = $task->estimated_minutes ?? 60;

            for ($i = 0; $i < count($days) && $minutes > 0; $i++) {
                $remaining = $days[$i]['capacity_minutes'] - $days[$i]['planned_minutes'];
                if ($remaining <= 0) {
                    continue;
                }

                $allocate = min($remaining, $minutes);
                $days[$i]['planned_minutes'] += $allocate;
                $days[$i]['tasks'][] = [
                    'task_id' => $task->id,
                    'title' => $task->title,
                    'allocated_minutes' => $allocate,
                ];
                $minutes -= $allocate;
            }
        }

        return $days;
    }
}
