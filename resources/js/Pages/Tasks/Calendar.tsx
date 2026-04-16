import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, Task } from '@/types';

type CalendarProps = PageProps<{
    tasks: Task[];
    labels: {
        pending: number;
        incoming: number;
        overdue: number;
        completed: number;
    };
    sections: {
        pending: Task[];
        incoming: Task[];
        overdue: Task[];
        completed: Task[];
    };
    today: string;
}>;

const statusBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

const sectionStyles: Record<string, string> = {
    pending: 'border-yellow-200 bg-yellow-50',
    incoming: 'border-cyan-200 bg-cyan-50',
    overdue: 'border-rose-200 bg-rose-50',
    completed: 'border-emerald-200 bg-emerald-50',
};

function formatDate(value: string | null) {
    if (!value) return 'N/A';

    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function startOfMonthGrid(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return start;
}

function endOfMonthGrid(date: Date) {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const day = end.getDay();
    end.setDate(end.getDate() + (6 - day));
    return end;
}

function dayKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function TaskList({ title, tasks, tone }: { title: string; tasks: Task[]; tone: string }) {
    return (
        <section className={`rounded-lg border p-4 ${tone}`}>
            <h3 className="text-sm font-semibold text-gray-800">{title} ({tasks.length})</h3>
            <div className="mt-3 space-y-2">
                {tasks.length === 0 ? (
                    <p className="text-sm text-gray-500">No tasks in this section.</p>
                ) : (
                    tasks.map((task) => (
                        <Link
                            key={task.id}
                            href={route('tasks.edit', task.id)}
                            className="block rounded-md bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <span className={`rounded-full px-2 py-0.5 font-medium ${statusBadge[task.status]}`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                                    {task.priority} priority
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Due: {formatDate(task.due_date)}</p>
                        </Link>
                    ))
                )}
            </div>
        </section>
    );
}

export default function Calendar({ labels, sections, today }: CalendarProps) {
    const todayDate = new Date(`${today}T00:00:00`);
    const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const monthGridStart = startOfMonthGrid(todayDate);
    const monthGridEnd = endOfMonthGrid(todayDate);

    const allTasksByDay = [...sections.pending, ...sections.incoming, ...sections.overdue, ...sections.completed].reduce<Record<string, Task[]>>((accumulator, task) => {
        if (!task.due_date) {
            return accumulator;
        }

        const key = task.due_date.slice(0, 10);
        accumulator[key] = accumulator[key] ?? [];
        accumulator[key].push(task);
        return accumulator;
    }, {});

    const days: Date[] = [];
    const cursor = new Date(monthGridStart);

    while (cursor <= monthGridEnd) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl leading-tight font-semibold text-gray-800">Task Calendar</h2>}
        >
            <Head title="Task Calendar" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Google-style task calendar</p>
                                <h3 className="mt-1 text-2xl font-bold text-slate-900">{monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                                <p className="mt-1 text-sm text-slate-600">Today: {formatDate(today)}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href={route('tasks.calendar.export')}
                                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Export .ics
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-3 border-b border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">Pending</p>
                                <p className="mt-2 text-3xl font-bold text-yellow-800">{labels.pending}</p>
                                <p className="mt-1 text-xs text-yellow-700">Tasks waiting to start or finish</p>
                            </div>
                            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Incoming</p>
                                <p className="mt-2 text-3xl font-bold text-cyan-800">{labels.incoming}</p>
                                <p className="mt-1 text-xs text-cyan-700">Upcoming deadlines on the horizon</p>
                            </div>
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Overdue</p>
                                <p className="mt-2 text-3xl font-bold text-rose-800">{labels.overdue}</p>
                                <p className="mt-1 text-xs text-rose-700">Tasks that need immediate attention</p>
                            </div>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Completed</p>
                                <p className="mt-2 text-3xl font-bold text-emerald-800">{labels.completed}</p>
                                <p className="mt-1 text-xs text-emerald-700">Work already finished</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="px-2 py-3">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
                            {days.map((day) => {
                                const key = dayKey(day);
                                const dayTasks = allTasksByDay[key] ?? [];
                                const isToday = key === today;
                                const isCurrentMonth = day.getMonth() === todayDate.getMonth();

                                return (
                                            <div key={key} className={`min-h-32 p-3 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/70'} ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}>
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className={isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}>{day.getDate()}</span>
                                            {isToday && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] text-white">Today</span>}
                                        </div>
                                        <div className="mt-2 space-y-1.5">
                                            {dayTasks.slice(0, 3).map((task) => (
                                                        <Link
                                                            key={task.id}
                                                            href={route('tasks.edit', task.id)}
                                                            className={`block rounded-md border px-2 py-1 text-[11px] font-medium shadow-sm transition hover:shadow-md ${sectionStyles[
                                                                task.status === 'completed'
                                                                    ? 'completed'
                                                                    : task.status === 'in_progress'
                                                                      ? 'incoming'
                                                                      : task.due_date && task.due_date < today
                                                                        ? 'overdue'
                                                                        : 'pending'
                                                            ]}`}
                                                        >
                                                            <p className="truncate text-slate-900">{task.title}</p>
                                                            <p className="mt-0.5 text-[10px] text-slate-600">
                                                                {task.status.replace('_', ' ')} · {task.priority}
                                                            </p>
                                                        </Link>
                                            ))}
                                            {dayTasks.length > 3 && (
                                                <p className="text-[10px] font-semibold text-slate-500">+{dayTasks.length - 3} more</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <TaskList title="Pending Tasks" tasks={sections.pending} tone={sectionStyles.pending} />
                        <TaskList title="Incoming Tasks" tasks={sections.incoming} tone={sectionStyles.incoming} />
                        <TaskList title="Overdue Tasks" tasks={sections.overdue} tone={sectionStyles.overdue} />
                        <TaskList title="Completed Tasks" tasks={sections.completed} tone={sectionStyles.completed} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
