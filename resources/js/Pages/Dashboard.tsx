import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import {
    CalendarDays,
    Edit3,
    FileDown,
    LogOut,
    PlusCircle,
    ShieldCheck,
    Trash2,
    TimerReset,
    UserCircle2,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import type {
    DashboardAnalytics,
    DashboardNotification,
    DashboardRecommendation,
    PageProps,
    PendingAdminApproval,
    StudyStats,
    Task,
    TaskPriority,
    TaskStatus,
    WeeklyPlanDay,
} from '@/types';

type DashboardProps = PageProps<{
    tasks: Task[];
    analytics: DashboardAnalytics;
    notifications: DashboardNotification[];
    recommendations: DashboardRecommendation[];
    weeklyPlan: WeeklyPlanDay[];
    studyStats: StudyStats;
    pendingAdminApprovals: PendingAdminApproval[];
}>;

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
};

const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed'];

const STATUS_PANEL_STYLES: Record<TaskStatus, string> = {
    pending: 'bg-yellow-50 border-yellow-200',
    in_progress: 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
};

type FeatureMenuItem = {
    label: string;
    href?: string;
    onClick?: () => void;
    method?: 'post';
    as?: 'button';
    icon: LucideIcon;
    tone: string;
    anchor?: boolean;
};

export default function Dashboard({ tasks, flash, analytics, notifications, recommendations, weeklyPlan, studyStats, pendingAdminApprovals }: DashboardProps) {
    const user = usePage().props.auth.user;
    const [notification, setNotification] = useState<string | null>(flash?.success ?? null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
    const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'shared'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [quickTitle, setQuickTitle] = useState('');
    const [activeTaskId, setActiveTaskId] = useState<number | ''>('');
    const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
    const [subtaskDrafts, setSubtaskDrafts] = useState<Record<number, string>>({});
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const timer = setInterval(() => {
            router.reload();
        }, 15000);

        return () => clearInterval(timer);
    }, []);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                searchTerm.trim() === '' ||
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.group_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesOwnership =
                ownershipFilter === 'all' ||
                (ownershipFilter === 'owned' && task.is_owner) ||
                (ownershipFilter === 'shared' && !task.is_owner);

            return matchesSearch && matchesStatus && matchesPriority && matchesOwnership;
        });
    }, [tasks, searchTerm, statusFilter, priorityFilter, ownershipFilter]);

    const handleDelete = (task: Task) => {
        if (confirm(`Delete task "${task.title}"?`)) {
            router.delete(route('tasks.destroy', task.id));
        }
    };

    const canManageTask = (task: Task) => task.is_owner || user.role === 'admin' || user.role === 'team_leader';

    const handleStatusChange = (task: Task, status: string) => {
        router.patch(
            route('tasks.update', task.id),
            {
                title: task.title,
                description: task.description,
                due_date: task.due_date,
                reminder_at: task.reminder_at,
                status,
                priority: task.priority,
                estimated_minutes: task.estimated_minutes,
                recurrence: task.recurrence ?? 'none',
                is_group_task: task.is_group_task,
                group_name: task.group_name,
                shared_user_ids: (task.shared_users ?? []).map((u) => u.id),
            },
            { preserveScroll: true },
        );
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: number) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(taskId));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        e.preventDefault();
        setDragOverStatus(status);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOverStatus(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
        e.preventDefault();
        setDragOverStatus(null);

        if (!draggedTaskId) return;

        const task = tasks.find((t) => t.id === draggedTaskId);
        if (task && task.status !== targetStatus && canManageTask(task)) {
            handleStatusChange(task, targetStatus);
        }

        setDraggedTaskId(null);
    };

    const handleQuickCapture = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTitle.trim()) {
            return;
        }

        router.post(
            route('tasks.quick-store'),
            { title: quickTitle.trim() },
            {
                preserveScroll: true,
                onSuccess: () => setQuickTitle(''),
            },
        );
    };

    const startFocusSession = () => {
        setSessionStartedAt(new Date());
    };

    const stopFocusSession = () => {
        if (!sessionStartedAt) {
            return;
        }

        const endedAt = new Date();
        const minutes = Math.max(1, Math.round((endedAt.getTime() - sessionStartedAt.getTime()) / 60000));

        router.post(
            route('study-sessions.store'),
            {
                task_id: activeTaskId === '' ? null : activeTaskId,
                minutes,
                session_started_at: sessionStartedAt.toISOString(),
                session_ended_at: endedAt.toISOString(),
            },
            { preserveScroll: true },
        );

        setSessionStartedAt(null);
    };

    const addSubtask = (taskId: number) => {
        const title = (subtaskDrafts[taskId] ?? '').trim();
        if (!title) {
            return;
        }

        router.post(
            route('tasks.subtasks.store', taskId),
            { title },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubtaskDrafts((prev) => ({ ...prev, [taskId]: '' }));
                },
            },
        );
    };

    const approveAdmin = (userId: number) => {
        router.post(route('admin.approvals.approve', userId), {}, { preserveScroll: true });
    };

    const featureMenuItems: FeatureMenuItem[] = [
        { label: 'Dashboard', href: route('dashboard'), icon: CalendarDays, tone: 'bg-slate-700 hover:bg-slate-600' },
        { label: 'Add Task', href: route('tasks.create'), icon: PlusCircle, tone: 'bg-indigo-600 hover:bg-indigo-500' },
        { label: 'Group Task', href: `${route('tasks.create')}?group=1`, icon: UsersRound, tone: 'bg-purple-600 hover:bg-purple-500' },
        { label: 'Calendar', href: route('tasks.calendar'), icon: FileDown, tone: 'bg-teal-600 hover:bg-teal-500' },
        { label: 'Profile', href: route('profile.edit'), icon: UserCircle2, tone: 'bg-cyan-600 hover:bg-cyan-500' },
        { label: 'Admin Approvals', href: route('admin.approvals.index'), icon: ShieldCheck, tone: 'bg-amber-600 hover:bg-amber-500' },
        { label: 'Logout', href: route('logout'), icon: LogOut, tone: 'bg-rose-600 hover:bg-rose-500', method: 'post', as: 'button' },
    ];

    const toggleSubtask = (taskId: number, subtaskId: number) => {
        router.patch(route('tasks.subtasks.toggle', [taskId, subtaskId]), {}, { preserveScroll: true });
    };

    const grouped = useMemo(() => {
        return {
            pending: filteredTasks.filter((t) => t.status === 'pending'),
            in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
            completed: filteredTasks.filter((t) => t.status === 'completed'),
        };
    }, [filteredTasks]);

    const maxPriorityCount = Math.max(
        1,
        analytics.priority_counts.low,
        analytics.priority_counts.medium,
        analytics.priority_counts.high,
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl leading-tight font-semibold text-gray-800">
                    My Tasks
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {notification && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700 shadow">
                            {notification}
                        </div>
                    )}

                    <div className="mb-6 rounded-lg bg-slate-900 p-4 text-slate-100 shadow" id="features-menu">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">System Features Menu</h3>
                            <span className="text-xs text-slate-300">Click an icon to open its page</span>
                        </div>
                        <div className="overflow-x-auto pb-1">
                            <div className="flex min-w-max items-center gap-2">
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
                                >
                                    <ApplicationLogo className="h-5 w-5 fill-current text-white" />
                                    <span>Dashboard Logo</span>
                                </Link>
                                {featureMenuItems
                                    .filter((item) => item.label !== 'Admin Approvals' || pendingAdminApprovals.length > 0)
                                    .map((item) => {
                                        const Icon = item.icon;
                                        const baseClass = `group inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${item.tone} text-white`;
                                        const icon = <Icon className="h-4 w-4 shrink-0" />;

                                        if (item.method === 'post') {
                                            return (
                                                <Link
                                                    key={item.label}
                                                    href={item.href ?? '#'}
                                                    method="post"
                                                    as="button"
                                                    className={baseClass}
                                                >
                                                    {icon}
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        }

                                        return (
                                            <Link key={item.label} href={item.href ?? '#'} className={baseClass}>
                                                {icon}
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    {pendingAdminApprovals.length > 0 && (
                        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm" id="admin-approvals">
                            <h3 className="text-sm font-semibold text-amber-900">Pending Admin Approvals</h3>
                            <p className="mt-1 text-xs text-amber-700">
                                These admin requests can only be approved by the configured approver account.
                            </p>
                            <div className="mt-3 space-y-2">
                                {pendingAdminApprovals.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        className="flex flex-col gap-2 rounded-md bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                                            <p className="text-xs text-gray-600">{candidate.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => approveAdmin(candidate.id)}
                                            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                                        >
                                            Approve Admin
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6 grid gap-4 lg:grid-cols-3">
                        <div className="rounded-lg bg-white p-4 shadow" id="quick-capture">
                            <h3 className="text-sm font-semibold text-gray-700">Quick Capture</h3>
                            <form onSubmit={handleQuickCapture} className="mt-3 flex gap-2">
                                <TextInput
                                    id="quick-task"
                                    type="text"
                                    value={quickTitle}
                                    onChange={(e) => setQuickTitle(e.target.value)}
                                    className="block w-full"
                                    placeholder="Add a task quickly..."
                                />
                                <button
                                    type="submit"
                                    className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                                >
                                    Add
                                </button>
                            </form>
                            <a
                                href={route('tasks.calendar.export')}
                                className="mt-3 inline-flex text-xs font-medium text-indigo-700 underline"
                                download
                            >
                                Export deadlines to calendar (.ics)
                            </a>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow" id="focus-session">
                            <h3 className="text-sm font-semibold text-gray-700">Focus Session</h3>
                            <div className="mt-3 space-y-2">
                                <select
                                    value={activeTaskId}
                                    onChange={(e) =>
                                        setActiveTaskId(e.target.value ? Number(e.target.value) : '')
                                    }
                                    className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">General study (no task)</option>
                                    {tasks.map((task) => (
                                        <option key={task.id} value={task.id}>
                                            {task.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={startFocusSession}
                                        disabled={!!sessionStartedAt}
                                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                    >
                                        Start
                                    </button>
                                    <button
                                        type="button"
                                        onClick={stopFocusSession}
                                        disabled={!sessionStartedAt}
                                        className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                    >
                                        Stop & Save
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    This week: {studyStats.weekly_hours}h / {studyStats.target_hours}h target
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow" id="progress">
                            <h3 className="text-sm font-semibold text-gray-700">Progress</h3>
                            <p className="mt-2 text-3xl font-bold text-indigo-700">
                                {analytics.insights.completion_rate}%
                            </p>
                            <p className="mt-1 text-xs text-gray-500">Completion rate</p>
                            <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                                <div
                                    className="h-2 rounded-full bg-indigo-600"
                                    style={{ width: `${analytics.insights.completion_rate}%` }}
                                />
                            </div>
                            <p className="mt-3 text-xs text-gray-600">{analytics.insights.focus_tip}</p>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow" id="productivity-insights">
                            <h3 className="text-sm font-semibold text-gray-700">Productivity Insights</h3>
                            <ul className="mt-3 space-y-2 text-sm text-gray-700">
                                <li>Completed this week: {analytics.insights.completed_this_week}</li>
                                <li>Overdue tasks: {analytics.insights.overdue_count}</li>
                                <li>Active tasks: {tasks.length - analytics.status_counts.completed}</li>
                            </ul>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow" id="notifications">
                            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                            <div className="mt-3 max-h-36 space-y-2 overflow-auto pr-1">
                                {notifications.length === 0 ? (
                                    <p className="text-sm text-gray-500">No notifications right now.</p>
                                ) : (
                                    notifications.map((item, index) => (
                                        <p
                                            key={`${item.type}-${item.task_id}-${index}`}
                                            className="rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-700"
                                        >
                                            {item.message}
                                        </p>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-4 shadow" id="recommendations">
                            <h3 className="text-sm font-semibold text-gray-700">Do This Next</h3>
                            <div className="mt-3 space-y-2">
                                {recommendations.length === 0 ? (
                                    <p className="text-sm text-gray-500">No recommended tasks right now.</p>
                                ) : (
                                    recommendations.map((item) => (
                                        <Link
                                            key={item.task_id}
                                            href={route('tasks.edit', item.task_id)}
                                            className="block rounded-md bg-gray-50 p-2 transition hover:bg-indigo-50"
                                        >
                                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-600">{item.reason} (score {item.score})</p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow" id="weekly-plan">
                            <h3 className="text-sm font-semibold text-gray-700">Weekly Study Plan</h3>
                            <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
                                {weeklyPlan.map((day) => (
                                    <div key={day.date} className="rounded-md bg-gray-50 p-2">
                                        <p className="text-xs font-semibold text-gray-700">
                                            {day.label}: {day.planned_minutes}/{day.capacity_minutes} min
                                        </p>
                                        {day.tasks.length > 0 ? (
                                            <ul className="mt-1 space-y-1 text-xs text-gray-600">
                                                {day.tasks.slice(0, 3).map((item) => (
                                                    <li key={`${day.date}-${item.task_id}`}>
                                                        <Link
                                                            href={route('tasks.edit', item.task_id)}
                                                            className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-white hover:text-indigo-700"
                                                        >
                                                            <span>{item.title}</span>
                                                            <Edit3 className="h-3 w-3" />
                                                            <span>({item.allocated_minutes}m)</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="mt-1 text-xs text-gray-500">No planned work.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-3 gap-4" id="status-overview">
                        <div className="rounded-lg bg-yellow-50 p-4 text-center shadow-sm">
                            <p className="text-2xl font-bold text-yellow-700">
                                {analytics.status_counts.pending}
                            </p>
                            <p className="text-sm text-yellow-600">Pending</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4 text-center shadow-sm">
                            <p className="text-2xl font-bold text-blue-700">
                                {analytics.status_counts.in_progress}
                            </p>
                            <p className="text-sm text-blue-600">In Progress</p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-4 text-center shadow-sm">
                            <p className="text-2xl font-bold text-green-700">
                                {analytics.status_counts.completed}
                            </p>
                            <p className="text-sm text-green-600">Completed</p>
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg bg-white p-4 shadow" id="priority-analytics">
                        <h3 className="text-sm font-semibold text-gray-700">Priority Analytics</h3>
                        <div className="mt-3 space-y-2">
                            {(['high', 'medium', 'low'] as TaskPriority[]).map((priority) => {
                                const value = analytics.priority_counts[priority];
                                const width = Math.round((value / maxPriorityCount) * 100);
                                return (
                                    <div key={priority}>
                                        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                                            <span>{PRIORITY_LABELS[priority]} Priority</span>
                                            <span>{value}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    priority === 'high'
                                                        ? 'bg-red-500'
                                                        : priority === 'medium'
                                                          ? 'bg-orange-500'
                                                          : 'bg-slate-500'
                                                }`}
                                                style={{ width: `${width}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between" id="task-toolbar">
                        <h3 className="text-lg font-medium text-gray-700">
                            All Tasks ({filteredTasks.length})
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`rounded-md px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                List
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('kanban')}
                                className={`rounded-md px-3 py-1.5 text-sm ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                Kanban
                            </button>
                            <Link
                                href={route('tasks.create')}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                + Add Task
                            </Link>
                            <Link
                                href={`${route('tasks.create')}?group=1`}
                                className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
                            >
                                + Create Group Task
                            </Link>
                        </div>
                    </div>

                    <div className="mb-4 grid gap-3 rounded-lg bg-white p-4 shadow md:grid-cols-4" id="task-filters">
                        <TextInput
                            id="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full"
                            placeholder="Search tasks, description, group..."
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value as 'all' | TaskPriority)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="all">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        <select
                            value={ownershipFilter}
                            onChange={(e) =>
                                setOwnershipFilter(e.target.value as 'all' | 'owned' | 'shared')
                            }
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="all">Owned + Shared</option>
                            <option value="owned">Owned only</option>
                            <option value="shared">Shared only</option>
                        </select>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow">
                            <p className="text-gray-500">
                                No matching tasks found. Try changing filters or create a new task.
                            </p>
                            <Link
                                href={route('tasks.create')}
                                className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                + Add Task
                            </Link>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="overflow-hidden rounded-lg bg-white shadow" id="task-board">
                            <ul className="divide-y divide-gray-100">
                                {filteredTasks.map((task) => (
                                    <li key={task.id} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600"
                                            checked={task.status === 'completed'}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    task,
                                                    e.target.checked ? 'completed' : 'pending',
                                                )
                                            }
                                            aria-label={`Mark "${task.title}" as completed`}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={route('tasks.edit', task.id)}
                                                className={`inline-flex max-w-full items-center gap-2 rounded-md font-medium text-gray-900 hover:text-indigo-700 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}
                                            >
                                                <span className="truncate">{task.title}</span>
                                                <Edit3 className="h-3.5 w-3.5 shrink-0" />
                                            </Link>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                                                    {PRIORITY_LABELS[task.priority]}
                                                </span>
                                                {task.is_group_task && task.group_name && (
                                                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                                                        Group: {task.group_name}
                                                    </span>
                                                )}
                                                {!task.is_owner && (
                                                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                                        Shared by {task.owner_name}
                                                    </span>
                                                )}
                                            </div>
                                            {task.description && (
                                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                    {task.description}
                                                </p>
                                            )}
                                            {task.due_date && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Due:{' '}
                                                    {new Date(task.due_date + 'T00:00:00').toLocaleDateString(
                                                        undefined,
                                                        { year: 'numeric', month: 'short', day: 'numeric' },
                                                    )}
                                                </p>
                                            )}
                                            {task.reminder_at && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Reminder:{' '}
                                                    {new Date(task.reminder_at).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            )}
                                            {task.recommended_start_date && task.status !== 'completed' && (
                                                <p className="mt-1 text-xs text-indigo-500">
                                                    Suggested start: {new Date(task.recommended_start_date + 'T00:00:00').toLocaleDateString()}
                                                </p>
                                            )}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Link
                                                    href={route('tasks.discussion', task.id)}
                                                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                                >
                                                    Chat
                                                </Link>
                                            </div>
                                            <div className="mt-2 rounded-md bg-gray-50 p-2">
                                                <p className="text-xs font-semibold text-gray-600">
                                                    Subtasks ({task.subtasks?.length ?? 0})
                                                </p>
                                                <div className="mt-1 space-y-1">
                                                    {(task.subtasks ?? []).slice(0, 3).map((subtask) => (
                                                        <label key={subtask.id} className="flex items-center gap-2 text-xs text-gray-600">
                                                            <input
                                                                type="checkbox"
                                                                checked={subtask.is_completed}
                                                                onChange={() => toggleSubtask(task.id, subtask.id)}
                                                                className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600"
                                                            />
                                                            <span className={subtask.is_completed ? 'line-through text-gray-400' : ''}>
                                                                {subtask.title}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {canManageTask(task) && (
                                                    <div className="mt-2 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={subtaskDrafts[task.id] ?? ''}
                                                            onChange={(e) =>
                                                                setSubtaskDrafts((prev) => ({
                                                                    ...prev,
                                                                    [task.id]: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="Add subtask"
                                                            className="w-full rounded-md border-gray-300 px-2 py-1 text-xs"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => addSubtask(task.id)}
                                                            className="rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task, e.target.value)}
                                                className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}
                                                aria-label="Task status"
                                            >
                                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            {canManageTask(task) && (
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('tasks.edit', task.id)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(task)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-3" id="task-board">
                            {STATUS_ORDER.map((status) => (
                                <div
                                    key={status}
                                    className={`rounded-lg border p-3 transition ${STATUS_PANEL_STYLES[status]} ${
                                        dragOverStatus === status
                                            ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-lg'
                                            : ''
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragEnter={(e) => handleDragEnter(e, status)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, status)}
                                >
                                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                                        {STATUS_LABELS[status]} ({grouped[status].length})
                                    </h4>
                                    <div className="space-y-3">
                                        {grouped[status].map((task) => (
                                            <div
                                                key={task.id}
                                                draggable={canManageTask(task)}
                                                onDragStart={(e) => canManageTask(task) && handleDragStart(e, task.id)}
                                                className={`rounded-md bg-white p-3 cursor-move transition ${
                                                    draggedTaskId === task.id
                                                        ? 'opacity-50 shadow-none'
                                                        : 'hover:shadow-md hover:scale-105 shadow-sm'
                                                } ${canManageTask(task) ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}`}
                                            >
                                                <Link
                                                    href={route('tasks.edit', task.id)}
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-indigo-700"
                                                >
                                                    <span className="truncate">{task.title}</span>
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </Link>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
                                                    >
                                                        {PRIORITY_LABELS[task.priority]}
                                                    </span>
                                                    {task.is_group_task && task.group_name && (
                                                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                                            {task.group_name}
                                                        </span>
                                                    )}
                                                </div>
                                                {task.due_date && (
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Due {new Date(task.due_date + 'T00:00:00').toLocaleDateString()}
                                                    </p>
                                                )}
                                                <div className="mt-3">
                                                    <Link
                                                        href={route('tasks.discussion', task.id)}
                                                        className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                                    >
                                                        Chat with group
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                        {grouped[status].length === 0 && (
                                            <p className="text-xs text-gray-500">No tasks in this lane.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
