import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, PendingAdminApproval } from '@/types';

type ApprovalsProps = PageProps<{
    pendingAdminApprovals: PendingAdminApproval[];
}>;

export default function Approvals({ pendingAdminApprovals }: ApprovalsProps) {
    const approveAdmin = (userId: number) => {
        router.post(route('admin.approvals.approve', userId), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl leading-tight font-semibold text-gray-800">Admin Approvals</h2>}
        >
            <Head title="Admin Approvals" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <p className="text-sm text-gray-600">
                            Pending admin accounts that require approval from the configured approver email.
                        </p>

                        <div className="mt-4 space-y-3">
                            {pendingAdminApprovals.length === 0 ? (
                                <p className="text-sm text-gray-500">No pending admin approvals right now.</p>
                            ) : (
                                pendingAdminApprovals.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        className="flex flex-col gap-3 rounded-md border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{candidate.name}</p>
                                            <p className="text-sm text-gray-600">{candidate.email}</p>
                                            <p className="text-xs text-gray-500">
                                                Requested: {candidate.admin_requested_at ?? 'N/A'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => approveAdmin(candidate.id)}
                                            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
                                        >
                                            Approve Admin
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
