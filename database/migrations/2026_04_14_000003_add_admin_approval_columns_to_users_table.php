<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('admin_requested_at')->nullable()->after('role');
            $table->timestamp('admin_approved_at')->nullable()->after('admin_requested_at');
            $table->string('admin_approved_by')->nullable()->after('admin_approved_at');
        });

        DB::table('users')
            ->where('role', 'admin')
            ->update([
                'admin_requested_at' => now(),
                'admin_approved_at' => now(),
                'admin_approved_by' => config('services.admin.approver_email'),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'admin_requested_at',
                'admin_approved_at',
                'admin_approved_by',
            ]);
        });
    }
};
