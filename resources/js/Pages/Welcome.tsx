import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_40%),radial-gradient(circle_at_bottom_right,_#cffafe,_transparent_35%)]" />

                <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl backdrop-blur">
                    <div className="flex flex-col items-center text-center">
                        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 p-3 ring-1 ring-slate-200">
                            <ApplicationLogo className="h-28 w-28" />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold text-slate-900">Student Task Tracker</h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Welcome to your productivity workspace. Manage academic tasks, monitor progress, and coordinate individual or group work, including group chats for task discussions, from one dashboard.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-left">
                            <h2 className="text-sm font-semibold text-blue-900">Welcome, Student</h2>
                            <p className="mt-1 text-xs text-blue-800">
                                Create tasks, set priorities and deadlines, track your completion rate, run focus sessions, plan your weekly study workload, and chat with your group on shared tasks.
                            </p>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                            <h2 className="text-sm font-semibold text-amber-900">Welcome, Admin</h2>
                            <p className="mt-1 text-xs text-amber-800">
                                Oversee system usage, approve admin requests, and support collaboration workflows so users can stay organized, productive, and connected in group chats.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3">
                        <Link
                            href={route('login')}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                        >
                            Login
                        </Link>

                        <Link
                            href={route('register')}
                            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
