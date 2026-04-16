<p>Hello {{ $user->name }},</p>

<p>Your admin access request for {{ config('app.name') }} has been approved.</p>

<p>
    <strong>Approved by:</strong> {{ $approvedBy }}<br>
    <strong>Approved at:</strong> {{ optional($user->admin_approved_at)->toDateTimeString() ?? now()->toDateTimeString() }}
</p>

<p>You can now log in as <strong>Admin</strong>.</p>
