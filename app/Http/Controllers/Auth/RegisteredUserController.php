<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\AdminApprovalRequested;
use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'approverEmail' => config('services.admin.approver_email'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', Rule::in(User::ROLES)],
        ]);

        $requestedRole = (string) $request->string('role');
        $approverEmail = (string) config('services.admin.approver_email');
        $isAdminRequest = $requestedRole === 'admin';
        $isAutoApprovedAdmin = $isAdminRequest && $approverEmail !== ''
            && strcasecmp((string) $request->email, $approverEmail) === 0;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $requestedRole,
            'admin_requested_at' => $isAdminRequest ? now() : null,
            'admin_approved_at' => $isAutoApprovedAdmin ? now() : null,
            'admin_approved_by' => $isAutoApprovedAdmin ? $approverEmail : null,
            'password' => Hash::make($request->password),
        ]);

        Task::insert([
            [
                'user_id' => $user->id,
                'title' => 'Complete your profile',
                'description' => 'Add profile details and verify your email.',
                'status' => 'pending',
                'due_date' => now()->addDay()->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Create your first task',
                'description' => 'Use the Add Task button to add your own task.',
                'status' => 'in_progress',
                'due_date' => now()->addDays(3)->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Mark a task as completed',
                'description' => 'Try checking off a task from your dashboard.',
                'status' => 'completed',
                'due_date' => now()->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        event(new Registered($user));

        if ($isAdminRequest && !$isAutoApprovedAdmin) {
            if ($approverEmail !== '') {
                try {
                    Mail::to($approverEmail)->send(new AdminApprovalRequested($user));
                } catch (Throwable $e) {
                    report($e);
                }
            }

            return redirect()->route('login')->with('status', 'Admin account request submitted. Approval is required from '.$approverEmail.'.');
        }

        if ($isAutoApprovedAdmin) {
            return redirect()->route('login')->with('status', 'Admin account created and approved. Please log in.');
        }

        if ($requestedRole === 'team_leader') {
            return redirect()->route('login')->with('status', 'Team leader account created. Please verify your email and log in.');
        }

        return redirect()->route('login')->with('status', 'Account created successfully. Please log in.');
    }
}
