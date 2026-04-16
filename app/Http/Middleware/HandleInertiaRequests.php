<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $notificationPayload = null;

        if ($user) {
            $unread = $user->unreadNotifications()->latest()->take(8)->get();

            $notificationPayload = [
                'unread_count' => $user->unreadNotifications()->count(),
                'items' => $unread->map(fn ($notification) => [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->data['title'] ?? 'Notification',
                    'message' => $notification->data['message'] ?? '',
                    'link' => $notification->data['link'] ?? null,
                    'task_id' => $notification->data['task_id'] ?? null,
                    'created_at' => optional($notification->created_at)?->toIso8601String(),
                ])->values(),
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'notifications' => $notificationPayload,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
