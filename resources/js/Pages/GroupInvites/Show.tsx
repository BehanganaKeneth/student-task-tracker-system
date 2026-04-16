import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

export default function Show({
    invite,
    canRegister,
}: {
    invite: {
        email: string;
        task_title: string;
        group_name: string | null;
    };
    canRegister: boolean;
}) {
    return (
        <>
            <Head title="Group Invitation" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.14),transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_55%,_#111827)]" />

                <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-white/8 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                    <div className="flex flex-col items-center text-center">
                        <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                            <ApplicationLogo className="h-24 w-24 text-white" />
                        </div>

                        <p className="mt-5 text-xs uppercase tracking-[0.3em] text-cyan-300">Group Invitation</p>
                        <h1 className="mt-2 text-3xl font-bold text-white">You have been invited to join a group task</h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                            This invitation is tied to <span className="font-semibold text-white">{invite.email}</span>. Log in with that email, or create an account with it if you are new to the system, to join the group task.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Task</p>
                            <p className="mt-2 text-lg font-semibold text-white">{invite.task_title}</p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Group</p>
                            <p className="mt-2 text-lg font-semibold text-white">{invite.group_name ?? 'Group Task'}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                            Log in
                        </Link>

                        {canRegister && (
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Create account
                            </Link>
                        )}
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        The invitation will be applied after you sign in with the invited email address.
                    </p>
                </div>
            </div>
        </>
    );
}
