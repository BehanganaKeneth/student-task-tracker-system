<p>Hello,</p>

<p>You have been invited to join a group task in {{ config('app.name') }}.</p>

<p>
    <strong>Task:</strong> {{ $task->title }}<br>
    <strong>Group:</strong> {{ $task->group_name ?? 'Group Task' }}<br>
    <strong>Invited email:</strong> {{ $invite->email }}
</p>

<p>Use the button below to open the invitation, then log in or create an account with the invited email address to join the group.</p>

<p>
    <a href="{{ $joinUrl }}" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none;">
        Join Group Task
    </a>
</p>
