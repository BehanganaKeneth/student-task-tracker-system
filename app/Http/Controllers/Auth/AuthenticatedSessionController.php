<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\TaskGroupInvite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canRegister' => Route::has('register'),
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        if ($redirectResponse = $this->consumeGroupInvite($request)) {
            return $redirectResponse;
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function consumeGroupInvite(Request $request): ?RedirectResponse
    {
        $token = $request->session()->pull('group_invite_token');

        if (!$token) {
            return null;
        }

        $invite = TaskGroupInvite::query()->with('task')->where('token', $token)->first();

        if (!$invite) {
            return redirect()->route('dashboard')->with('error', 'The invitation link is no longer valid.');
        }

        if (Str::lower($request->user()->email) !== Str::lower($invite->email)) {
            return redirect()->route('dashboard')->with('error', 'Log in with the invited email address to join this group.');
        }

        if (!$invite->accepted_at) {
            $invite->task->sharedUsers()->syncWithoutDetaching([$request->user()->id]);
            $invite->update([
                'accepted_at' => now(),
                'accepted_user_id' => $request->user()->id,
            ]);
        }

        return redirect()->route('tasks.edit', $invite->task_id)->with('success', 'You have joined the group task.');
    }
}
