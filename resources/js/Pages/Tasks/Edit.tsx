import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, Task, User } from '@/types';

type EditForm = {
    title: string;
    is_group_task: boolean;
    group_name: string;
    group_member_emails: string;
    description: string;
    due_date: string;
    reminder_at: string;
    status: string;
    priority: string;
    estimated_minutes: string;
    recurrence: string;
    shared_user_ids: number[];
};

type EditTask = Task & { shared_user_ids?: number[] };
type EditProps = PageProps<{ task: EditTask; shareableUsers: User[] }>;

export default function Edit({ task, shareableUsers }: EditProps) {
    const { data, setData, patch, processing, errors } = useForm<EditForm>({
        title: task.title,
        is_group_task: task.is_group_task,
        group_name: task.group_name ?? '',
        group_member_emails: (task.group_member_emails ?? []).join(', '),
        description: task.description ?? '',
        due_date: task.due_date ?? '',
        reminder_at: task.reminder_at ? task.reminder_at.slice(0, 16) : '',
        status: task.status,
        priority: task.priority,
        estimated_minutes: task.estimated_minutes ? String(task.estimated_minutes) : '60',
        recurrence: task.recurrence ?? 'none',
        shared_user_ids: task.shared_user_ids ?? [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('tasks.update', task.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl leading-tight font-semibold text-gray-800">
                        Edit Task
                    </h2>
                    <Link
                        href={route('tasks.discussion', task.id)}
                        className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                        Open Discussion
                    </Link>
                </div>
            }
        >
            <Head title="Edit Task" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            {/* Title */}
                            <div>
                                <InputLabel htmlFor="title" value="Title" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                    autoFocus
                                    maxLength={255}
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="priority" value="Priority" />
                                    <select
                                        id="priority"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <InputError message={errors.priority} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="estimated_minutes" value="Estimated Effort (minutes)" />
                                    <TextInput
                                        id="estimated_minutes"
                                        type="number"
                                        min={5}
                                        max={1440}
                                        value={data.estimated_minutes}
                                        onChange={(e) => setData('estimated_minutes', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.estimated_minutes} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="recurrence" value="Recurring Routine" />
                                    <select
                                        id="recurrence"
                                        value={data.recurrence}
                                        onChange={(e) => setData('recurrence', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="none">None</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                    <InputError message={errors.recurrence} className="mt-2" />
                                </div>
                            </div>

                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={data.is_group_task}
                                        onChange={(e) => setData('is_group_task', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Group task
                                </label>

                                {data.is_group_task && (
                                    <div className="mt-3 space-y-3">
                                        <InputLabel htmlFor="group_name" value="Group Name" />
                                        <TextInput
                                            id="group_name"
                                            type="text"
                                            value={data.group_name}
                                            onChange={(e) => setData('group_name', e.target.value)}
                                            className="mt-1 block w-full"
                                            maxLength={255}
                                        />
                                        <InputError message={errors.group_name} className="mt-2" />

                                        <div className="rounded-md border border-indigo-200 bg-white p-3">
                                            <InputLabel htmlFor="group_member_emails" value="Group Members (emails)" />
                                            <textarea
                                                id="group_member_emails"
                                                value={data.group_member_emails}
                                                onChange={(e) => setData('group_member_emails', e.target.value)}
                                                rows={4}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                placeholder="friend1@example.com, friend2@example.com"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Enter the email addresses of the people who should be invited to this group task.
                                            </p>
                                            <InputError message={errors.group_member_emails} className="mt-2" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <InputLabel htmlFor="description" value="Description (optional)" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    maxLength={2000}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="due_date" value="Due Date (optional)" />
                                    <TextInput
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.due_date} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="reminder_at" value="Reminder (optional)" />
                                    <TextInput
                                        id="reminder_at"
                                        type="datetime-local"
                                        value={data.reminder_at}
                                        onChange={(e) => setData('reminder_at', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.reminder_at} className="mt-2" />
                                </div>
                            </div>

                            {!data.is_group_task && (
                                <div>
                                <InputLabel htmlFor="shared_user_ids" value="Share With (optional)" />
                                <select
                                    id="shared_user_ids"
                                    multiple
                                    value={data.shared_user_ids.map(String)}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions).map((option) =>
                                            Number(option.value),
                                        );
                                        setData('shared_user_ids', selected);
                                    }}
                                    className="mt-1 block min-h-28 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {shareableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email}) - {user.role}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Hold Ctrl (Windows) to select multiple users.
                                </p>
                                <InputError
                                    message={
                                        errors.shared_user_ids ||
                                        (errors as Record<string, string>)['shared_user_ids.0']
                                    }
                                    className="mt-2"
                                />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('dashboard')}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
