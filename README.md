# Student Task Tracker System

## Project Title

Development of a Web-Based Student Task Tracker Using **Laravel (PHP) and React**

## Project Description

This project is a **web-based system designed to help students organize and manage academic tasks** such as assignments, study activities, and deadlines.

The system is being developed using:

* **Laravel** – Backend framework (PHP)
* **React** – Frontend interface
* **MySQL** – Database

This repository contains the **current implementation progress for Test 2**.

---

# Current Progress

The following components have been successfully implemented:

* Laravel project setup
* Database configuration
* Default Laravel migrations
* Laravel Breeze authentication installation
* Node.js frontend dependency installation
* Local development server setup

The application currently runs successfully on the Laravel development server.

Further development will include:

* Task creation
* Task editing and deletion
* Task status tracking
* React dashboard interface

---

# Requirements

To run the project locally, install the following:

* PHP 8+
* Composer
* Node.js and npm
* MySQL
* A web browser

---

# How to Run the Project

### 1. Clone the repository

```bash
git clone <[your-github-repository-link](https://github.com/BehanganaKeneth/student-task-tracker-system/tree/main)>
```

### 2. Navigate to the project folder

```bash
cd student-task-tracker
```

### 3. Install Laravel dependencies

```bash
composer install
```

### 4. Create environment file

```bash
cp .env.example .env
```

### 5. Generate application key

```bash
php artisan key:generate
```

### 6. Configure the database

Edit `.env` and set:

```
DB_DATABASE=student_tracker
DB_USERNAME=root
DB_PASSWORD=
```

### 7. Run database migrations

```bash
php artisan migrate
```

### 8. Install frontend dependencies

```bash
npm install
```

### 9. Start the frontend development server

```bash
npm run dev
```

### 10. Start the Laravel server

Open another terminal and run:

```bash
php artisan serve
```

---

# Access the Application

Open the application in a browser:

```
http://127.0.0.1:8000
```

---

# Author

**Name:** *(BEHANGANA KENETH)*
**Registration Number:** *(JAN23/BSE/2532U)*
**Program:** BSc Software Engineering YEAR 4

---
