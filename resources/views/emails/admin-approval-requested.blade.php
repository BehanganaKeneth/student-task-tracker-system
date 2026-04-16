<p>Hello,</p>

<p>A new admin approval request has been submitted in {{ config('app.name') }}.</p>

<p>
    <strong>Name:</strong> {{ $user->name }}<br>
    <strong>Email:</strong> {{ $user->email }}<br>
    <strong>Requested at:</strong> {{ optional($user->admin_requested_at)->toDateTimeString() ?? now()->toDateTimeString() }}
</p>

<p>Sign in with the approver account to review and approve this request from the dashboard.</p>
