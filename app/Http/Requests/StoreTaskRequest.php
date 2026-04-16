<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('group_member_emails')) {
            return;
        }

        $groupMemberEmails = $this->input('group_member_emails', []);

        if (is_string($groupMemberEmails)) {
            $groupMemberEmails = preg_split('/[\r\n,]+/', $groupMemberEmails, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        }

        $groupMemberEmails = collect($groupMemberEmails)
            ->map(fn ($email) => trim((string) $email))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $this->merge([
            'group_member_emails' => $groupMemberEmails,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'due_date' => ['nullable', 'date'],
            'reminder_at' => ['nullable', 'date'],
            'status' => ['required', Rule::in(Task::STATUSES)],
            'priority' => ['required', Rule::in(Task::PRIORITIES)],
            'estimated_minutes' => ['nullable', 'integer', 'min:5', 'max:1440'],
            'recurrence' => ['required', Rule::in(Task::RECURRENCES)],
            'is_group_task' => ['nullable', 'boolean'],
            'group_name' => ['nullable', 'string', 'max:255', 'required_if:is_group_task,1'],
            'group_member_emails' => ['nullable', 'array', 'required_if:is_group_task,1', 'min:1'],
            'group_member_emails.*' => ['email', 'distinct'],
            'shared_user_ids' => ['nullable', 'array'],
            'shared_user_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
