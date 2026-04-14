# TaskFlow SaaS - Local Development Guide

This document outlines the complete steps to run the TaskFlow SaaS project on your local Windows machine. 

The project uses a **Next.js** frontend and a **Django** backend configured with a local SQLite database, meaning no Docker or external database services are required to run it.

## Quick Start (Automated)

The easiest way to start the entire project is to use the provided setup script:

1. Open your terminal or Command Prompt in the root folder (`taskflow-saas`).
2. Run the batch file:
   ```cmd
   .\run_local.bat
   ```
3. This script will automatically:
   - Create a Python virtual environment and install backend dependencies.
   - Run database migrations and seed it with demo data.
   - Start the Django backend server in a new window.
   - Install all NPM packages for the frontend.
   - Start the Next.js frontend development server in a second new window.

---

## Manual Start Steps

If you prefer to run the components manually spread across different terminal windows, follow these steps:

### 1. Start the Backend (Django)

Open your first terminal and run the following commands:

1. **Navigate to the backend directory**:
   ```cmd
   cd backend
   ```
2. **Activate the Virtual Environment**:
   ```cmd
   .\venv\Scripts\activate
   ```
   *(Note: If `venv` does not exist, create it first using `python -m venv venv` and configure dependencies with `pip install -r requirements.txt`)*

3. **Run Migrations (Optional, if DB is already set up)**:
   ```cmd
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Start the Django Server**:
   ```cmd
   python manage.py runserver 8000
   ```
Your backend API will now be running at `http://localhost:8000/api/`.

### 2. Start the Frontend (Next.js)

Open a **second** terminal window and run:

1. **Navigate to the frontend directory**:
   ```cmd
   cd frontend
   ```
2. **Install Dependencies** (Only needed the very first time):
   ```cmd
   npm install
   ```

3. **Start the Next.js Server**:
   ```cmd
   npm run dev
   ```
Your frontend will now be actively running at `http://localhost:3000`.

---

## Application Access

Once both servers are running, access the project via:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Base:** [http://localhost:8000](http://localhost:8000)

**Demo Credentials:**
If you seeded the database or ran `run_local.bat`, use the following default dummy profile to login to the dashboard:
- **Email:** `admin@taskflow.com`
- **Password:** `admin123`
