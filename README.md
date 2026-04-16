# Student Task Tracker System

A Laravel 12 + Inertia.js + React task management platform for students and admins. It now includes role-based access, admin approval, group task invitations, group chat, a dedicated calendar view, and a dashboard with task analytics.

## Updated Features

- Guest welcome page with Login and Create Account actions
- Shared authentication flow for students and admins
- Role-based sign-in and registration
- Admin approval workflow for new admin accounts
- Email notifications for admin approval requests and approvals
- Dashboard with task analytics, notifications, and quick capture
- Task CRUD with status, priority, due date, reminder, recurrence, and effort tracking
- List and Kanban views for task management
- Search and filter controls for tasks
- Group tasks with group name and email-based invitations
- Invitation links sent to group members by email
- Task discussion/chat page for owners and invited members
- Clickable task shortcuts for editing, discussion, subtasks, and status updates
- In-app calendar page instead of a direct file download
- Profile page, logout action, and feature menu on the dashboard
- Responsive UI built with Tailwind CSS and Inertia React pages

## System Structure

```text
student-task-tracker-system-main/
├─ app/
│  ├─ Http/
│  │  ├─ Controllers/        # Dashboard, auth, task, invite, and chat actions
│  │  ├─ Middleware/         # Request middleware
│  │  └─ Requests/           # Form validation and input normalization
│  ├─ Mail/                  # Email approval and group invitation mailables
│  ├─ Models/                # Task, User, TaskMessage, TaskGroupInvite, and related models
│  ├─ Policies/              # Task access control
│  └─ Providers/             # App bootstrapping and policy registration
├─ bootstrap/                # Framework bootstrap files
├─ config/                   # Laravel configuration files
├─ database/
│  ├─ factories/             # Model factories
│  ├─ migrations/            # Database schema changes
│  └─ seeders/               # Seed data
├─ public/                   # Public entry point and built assets
├─ resources/
│  ├─ css/                   # Global styles
│  ├─ js/
│  │  ├─ Components/         # Reusable UI components
│  │  ├─ Layouts/            # Guest and authenticated layouts
│  │  ├─ Pages/              # Inertia pages for dashboard, auth, tasks, calendar, chat
│  │  └─ types/              # Shared TypeScript interfaces
│  └─ views/                 # Blade views and email templates
├─ routes/
│  ├─ auth.php               # Authentication routes
│  ├─ console.php            # Console routes and commands
│  └─ web.php                # Web routes and protected application pages
├─ storage/                  # Logs, cached views, sessions, and generated files
├─ tests/                    # Feature and unit tests
├─ vite.config.ts            # Frontend build config
├─ package.json              # Frontend scripts and dependencies
└─ composer.json             # PHP dependencies and app scripts
```

## Tech Stack

- Backend: Laravel 12, PHP 8.3+
- Frontend: React, TypeScript, Inertia.js
- Styling: Tailwind CSS v4
- Build tool: Vite
- Database: MySQL

## Prerequisites

- PHP 8.3 or later
- Composer
- Node.js 18+ and npm
- MySQL

## Setup

1. Install PHP dependencies:

```bash
composer install
```

2. Install frontend dependencies:

```bash
npm install
```

3. Copy the environment file and generate an app key:

```bash
copy .env.example .env
php artisan key:generate
```

4. Configure your database and mail settings in .env.

5. Run migrations:

```bash
php artisan migrate
```

6. Build frontend assets:

```bash
npm run build
```

## Run Locally

Terminal 1:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:8000
```

You can also use the combined script:

```bash
composer run dev
```

## Mail Configuration

The app uses SMTP for admin approval emails and group invite links. For Gmail SMTP:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tuancreations.africa@gmail.com
MAIL_PASSWORD=your-google-app-password
MAIL_FROM_ADDRESS="tuancreations.africa@gmail.com"
MAIL_FROM_NAME="${APP_NAME}"
ADMIN_APPROVER_EMAIL=tuancreations.africa@gmail.com
```

After changing env values, run:

```bash
php artisan optimize:clear
```

## Default Flow

1. Open the welcome page.
2. Log in or create an account.
3. Open the dashboard.
4. Create personal or group tasks.
5. Invite group members by email.
6. Use the task discussion page for group chat.
7. Track tasks in list, Kanban, and calendar views.

## Quality Checks

```bash
composer test
```

```bash
composer lint
```

```bash
npm run types
```

```bash
npm run format
```

## Troubleshooting

### 419 Page Expired

- Use one host consistently, such as 127.0.0.1.
- Make sure APP_URL matches the actual URL.
- Clear browser cookies and run `php artisan optimize:clear`.

### Blank page after login

- Rebuild assets with `npm run build`.
- Remove `public/hot` if a stale Vite dev server file exists.

### Session issues

- Ensure `SESSION_DRIVER=file` if you are using file sessions.
- Confirm `storage/framework/sessions` exists and is writable.

### Seeder autoload error

```bash
composer dump-autoload -o
```

## Notes

- The main web routes live in [routes/web.php](routes/web.php).
- Inertia pages live under [resources/js/Pages](resources/js/Pages).
- Collaboration data now includes task sharing, group invites, and task messages.

## Author

- Name: BEHANGANA KENETH
- Registration Number: JAN23/BSE/2532U
- Program: BSc Software Engineering, Year 4
- University: Universal Technology and Management University (utamu.ac.ug)