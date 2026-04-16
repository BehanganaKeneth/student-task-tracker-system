<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\TaskGroupInvite;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GroupTaskInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Task $task, public TaskGroupInvite $invite)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You have been invited to a group task: '.$this->task->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.group-task-invitation',
            with: [
                'task' => $this->task,
                'invite' => $this->invite,
                'joinUrl' => route('group-invites.show', $this->invite->token),
            ],
        );
    }
}
