<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->after('email');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->string('priority')->default('medium')->after('status');
            $table->timestamp('reminder_at')->nullable()->after('due_date');
            $table->timestamp('completed_at')->nullable()->after('status');
            $table->boolean('is_group_task')->default(false)->after('title');
            $table->string('group_name')->nullable()->after('is_group_task');
        });

        Schema::create('task_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['task_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_user');

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'priority',
                'reminder_at',
                'completed_at',
                'is_group_task',
                'group_name',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
