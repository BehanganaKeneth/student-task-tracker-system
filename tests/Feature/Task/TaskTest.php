<?php

namespace Tests\Feature\Task;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_dashboard_with_tasks(): void
    {
        $user = User::factory()->create();
        $tasks = Task::factory(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard')
                 ->has('tasks', 3)
        );
    }

    public function test_guest_is_redirected_from_dashboard(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_create_a_task(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('tasks.store'), [
            'title' => 'Study for finals',
            'description' => 'Review chapters 1-5',
            'due_date' => '2030-12-31',
            'status' => 'pending',
            'priority' => 'medium',
            'recurrence' => 'none',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'title' => 'Study for finals',
            'status' => 'pending',
        ]);
    }

    public function test_task_title_is_required(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('tasks.store'), [
            'title' => '',
            'status' => 'pending',
        ]);

        $response->assertSessionHasErrors(['title']);
    }

    public function test_task_status_must_be_valid(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('tasks.store'), [
            'title' => 'Test Task',
            'status' => 'invalid_status',
        ]);

        $response->assertSessionHasErrors(['status']);
    }

    public function test_user_can_update_their_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id, 'status' => 'pending']);

        $response = $this->actingAs($user)->patch(route('tasks.update', $task), [
            'title' => 'Updated Title',
            'description' => null,
            'due_date' => null,
            'status' => 'completed',
            'priority' => 'high',
            'recurrence' => 'none',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated Title',
            'status' => 'completed',
        ]);
    }

    public function test_user_cannot_update_another_users_task(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser)->patch(route('tasks.update', $task), [
            'title' => 'Hijacked Title',
            'status' => 'completed',
            'priority' => 'low',
            'recurrence' => 'none',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id, 'title' => 'Hijacked Title']);
    }

    public function test_user_can_delete_their_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete(route('tasks.destroy', $task));

        $response->assertRedirect(route('dashboard'));
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_user_cannot_delete_another_users_task(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser)->delete(route('tasks.destroy', $task));

        $response->assertForbidden();
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    public function test_edit_page_shows_for_task_owner(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('tasks.edit', $task));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Tasks/Edit')
                 ->has('task')
        );
    }

    public function test_dashboard_tasks_only_show_current_users_tasks(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Task::factory(2)->create(['user_id' => $user->id]);
        Task::factory(3)->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard')
                 ->has('tasks', 2)
        );
    }
}
