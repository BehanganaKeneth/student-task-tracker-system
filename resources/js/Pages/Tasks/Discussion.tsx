import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, Task, TaskMessage } from '@/types';

type DiscussionProps = PageProps<{
    task: Task;
    messages: TaskMessage[];
}>;

export default function Discussion({ task, messages }: DiscussionProps) {
    const user = usePage().props.auth.user;
    const [liveMessages, setLiveMessages] = useState(messages);
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channelName = `tasks.${task.id}`;
        const channel = window.Echo.private(channelName);

        channel.listen('.TaskMessageCreated', (event: TaskMessage) => {
            setLiveMessages((current) => {
                if (current.some((message) => message.id === event.id)) {
                    return current;
                }

                return [
                    ...current,
                    {
                        ...event,
                        is_current_user: event.user_id === user.id,
                    },
                ];
            });

            if (event.user_id !== user.id && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`New message in ${task.title}`, {
                    body: event.message,
                });
            }
        });

        return () => {
            window.Echo?.leave(channelName);
        };
    }, [task.id, task.title, user.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('tasks.messages.store', task.id), {
            preserveScroll: true,
            onSuccess: () => reset('message'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800">
                            Task Discussion
                        </h2>
                        <p className="text-sm text-gray-500">Chat with group members inside this task.</p>
                    </div>
                    <Link
                        href={route('tasks.edit', task.id)}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        Back to Task
                    </Link>
                </div>
            }
        >
            <Head title={`Discussion - ${task.title}`} />

            <div className="py-8">
                <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:px-8 xl:grid-cols-[1.7fr_1fr]">
                    <div className="rounded-2xl bg-white shadow">
                        <div className="border-b border-gray-100 p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                                {task.is_group_task ? 'Group Task' : 'Task Thread'}
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-gray-900">{task.title}</h3>
                            {task.group_name && (
                                <p className="mt-1 text-sm text-gray-500">{task.group_name}</p>
                            )}
                            {task.description && (
                                <p className="mt-4 text-sm leading-6 text-gray-600">{task.description}</p>
                            )}
                        </div>

                        <div className="max-h-[32rem] space-y-4 overflow-y-auto p-6">
                            {liveMessages.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                                    No messages yet. Start the conversation for this task.
                                </div>
                            ) : (
                                liveMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.is_current_user ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${message.is_current_user ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}
                                        >
                                            <div className={`mb-1 flex items-center justify-between gap-3 text-xs ${message.is_current_user ? 'text-indigo-100' : 'text-gray-500'}`}>
                                                <span className="font-semibold">{message.user.name}</span>
                                                <span>
                                                    {new Date(message.created_at).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t border-gray-100 p-6">
                            <form onSubmit={submit} className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="message">
                                    Write a message
                                </label>
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={4}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Ask a question, share progress, or leave a note..."
                                    maxLength={2000}
                                />
                                <InputError message={errors.message} />
                                <div className="flex items-center justify-end gap-3">
                                    {(task.is_owner || user.role === 'admin' || user.role === 'team_leader') && (
                                        <Link href={route('tasks.edit', task.id)} className="text-sm text-gray-600 hover:text-gray-900">
                                            Edit task
                                        </Link>
                                    )}
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Sending…' : 'Send'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow">
                            <h4 className="text-sm font-semibold text-gray-700">Members</h4>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-lg bg-indigo-50 p-3">
                                    <p className="text-xs uppercase tracking-wide text-indigo-600">Owner</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{task.owner_name ?? 'Task Owner'}</p>
                                </div>
                                {(task.shared_users ?? []).length > 0 ? (
                                    task.shared_users?.map((member) => (
                                        <div key={member.id} className="rounded-lg bg-gray-50 p-3">
                                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.email}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No additional members yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-6 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-700">Tips</h4>
                            <ul className="mt-3 space-y-2 text-sm text-gray-600">
                                <li>Use this thread to coordinate updates on the task.</li>
                                <li>Keep messages short and task-specific.</li>
                                <li>Only invited members and the owner can read this thread.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
