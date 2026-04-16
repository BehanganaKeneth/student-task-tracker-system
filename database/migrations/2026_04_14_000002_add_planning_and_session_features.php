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
            $table->unsignedTinyInteger('study_hours_per_day')->default(2)->after('role');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedSmallInteger('estimated_minutes')->nullable()->after('priority');
            $table->string('recurrence')->default('none')->after('estimated_minutes');
            $table->date('recommended_start_date')->nullable()->after('recurrence');
        });

        Schema::create('task_subtasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
        });

        Schema::create('study_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('minutes');
            $table->timestamp('session_started_at')->nullable();
            $table->timestamp('session_ended_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_sessions');
        Schema::dropIfExists('task_subtasks');

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['estimated_minutes', 'recurrence', 'recommended_start_date']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('study_hours_per_day');
        });
    }
};
