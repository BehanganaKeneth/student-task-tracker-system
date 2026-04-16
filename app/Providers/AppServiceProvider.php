<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::verifyEmailView(function (Request $request) {
            return Inertia::render('Auth/VerifyEmail', [
                'status' => $request->session()->get('status'),
            ]);
        });

        Vite::prefetch(concurrency: 3);
    }
}
