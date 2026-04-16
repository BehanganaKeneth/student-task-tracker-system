export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'team_leader' | 'student';
    admin_requested_at?: string | null;
    admin_approved_at?: string | null;
    admin_approved_by?: string | null;
    email_verified_at?: string;
}

export interface PendingAdminApproval {
    id: number;
    name: string;
    email: string;
    admin_requested_at: string | null;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskRecurrence = 'none' | 'daily' | 'weekly';

export interface TaskSubtask {
    id: number;
    task_id: number;
    title: string;
    is_completed: boolean;
}

export interface TaskMessage {
    id: number;
    task_id: number;
    user_id: number;
    message: string;
    created_at: string;
    user: User;
    is_current_user?: boolean;
}

export interface Task {
    id: number;
    user_id: number;
    title: string;
    is_group_task: boolean;
    group_name: string | null;
    description: string | null;
    due_date: string | null;
    reminder_at: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    estimated_minutes?: number | null;
    recurrence?: TaskRecurrence;
    recommended_start_date?: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    owner_name?: string | null;
    is_owner?: boolean;
    shared_users?: User[];
    group_member_emails?: string[];
    pending_group_invites?: string[];
    messages_count?: number;
    subtasks?: TaskSubtask[];
}

export interface DashboardAnalytics {
    status_counts: Record<TaskStatus, number>;
    priority_counts: Record<TaskPriority, number>;
    insights: {
        completion_rate: number;
        completed_this_week: number;
        overdue_count: number;
        focus_tip: string;
    };
}

export interface DashboardNotification {
    type: 'overdue' | 'due_today' | 'reminder' | 'risk';
    message: string;
    task_id: number;
}

export interface DashboardRecommendation {
    task_id: number;
    title: string;
    score: number;
    reason: string;
}

export interface WeeklyPlanTaskItem {
    task_id: number;
    title: string;
    allocated_minutes: number;
}

export interface WeeklyPlanDay {
    date: string;
    label: string;
    capacity_minutes: number;
    planned_minutes: number;
    tasks: WeeklyPlanTaskItem[];
}

export interface StudyStats {
    weekly_minutes: number;
    weekly_hours: number;
    target_hours: number;
}

export interface InAppNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    task_id?: number | null;
    created_at?: string | null;
}

export interface NotificationCenter {
    unread_count: number;
    items: InAppNotification[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        notifications?: NotificationCenter;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};
