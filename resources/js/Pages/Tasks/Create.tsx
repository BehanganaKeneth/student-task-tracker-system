import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, User } from '@/types';

type CreateForm = {
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

type CreateProps = PageProps<{ shareableUsers: User[] }>;

export default function Create({ shareableUsers }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm<CreateForm>({
        title: '',
        is_group_task: false,
        group_name: '',
        group_member_emails: '',
        description: '',
        due_date: '',
        reminder_at: '',
        status: 'pending',
        priority: 'medium',
        estimated_minutes: '60',
        recurrence: 'none',
        shared_user_ids: [],
    });

    useEffect(() => {
        const search = new URLSearchParams(window.location.search);
        if (search.get('group') === '1') {
            setData('is_group_task', true);
        }
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tasks.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl leading-tight font-semibold text-gray-800">
                    Create Task
                </h2>
            }
        >
            <Head title="Create Task" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="rounded-md bg-indigo-50 p-3 text-sm text-indigo-800">
                                To register a group task, enable Group task, enter the group name, then select members in Share With.
                            </div>

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
                                    placeholder="e.g. Complete Math Assignment"
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
                                            placeholder="e.g. Software Engineering Team"
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
                                                Enter one or more email addresses separated by commas or new lines. Each person will receive an email link to join the group.
                                            </p>
                                            <InputError message={errors.group_member_emails} className="mt-2" />
                                            {data.group_member_emails.trim().length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {data.group_member_emails
                                                        .split(/[\n,]+/)
                                                        .map((email) => email.trim())
                                                        .filter(Boolean)
                                                        .map((email) => (
                                                            <span
                                                                key={email}
                                                                className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
                                                            >
                                                                {email}
                                                            </span>
                                                        ))}
                                                </div>
                                            )}
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
                                    placeholder="Add any notes or details..."
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
                                    {processing ? 'Saving…' : 'Create Task'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
