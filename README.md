# TaskFlow — Smart Task Management System

A production-ready, SaaS-level task management platform inspired by Jira, built with **Django REST Framework** + **Next.js 15** + **TypeScript**.

![TaskFlow](https://img.shields.io/badge/TaskFlow-v1.0-6366f1?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=flat-square&logo=django)
![Next.js](https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)

---

## ✨ Features

- **Kanban Board** — Drag-and-drop task management with TODO, In Progress, In Review, Done columns
- **Team Collaboration** — Create teams, invite members, assign roles (Owner/Admin/Member)
- **Real-time Analytics** — Interactive charts for task status, priority distribution, team productivity
- **JWT Authentication** — Secure login/register with auto-refresh tokens
- **Dark/Light Mode** — Seamless theme switching with CSS variables
- **Email Notifications** — Celery-powered deadline reminders and task assignment emails
- **Role-Based Access** — Admin and Member permission levels
- **Activity Logging** — Full audit trail of all task and team actions
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile devices

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS v4, Recharts |
| **Backend** | Django 5, Django REST Framework, Simple JWT |
| **Database** | MySQL 8.0 |
| **Cache/Broker** | Redis 7 |
| **Background Jobs** | Celery + Celery Beat |
| **Reverse Proxy** | NGINX |
| **CI/CD** | GitHub Actions |
| **Deployment** | Render (backend) + Vercel (frontend) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

### Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Seed demo data
python manage.py seed_data

# Start server
python manage.py runserver
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start dev server
npm run dev
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@taskflow.com | admin123! |
| **Member** | sarah@taskflow.com | password123! |

---

## 📁 Project Structure

```
taskflow-saas/
├── backend/                  # Django REST Framework
│   ├── config/               # Settings, URLs, Celery
│   │   └── settings/         # base.py, development.py, production.py
│   ├── users/                # Auth, User model, JWT
│   ├── teams/                # Team management
│   ├── tasks/                # Task CRUD, Comments, Activity
│   ├── analytics/            # Dashboard analytics API
│   ├── management/commands/  # seed_data command
│   └── requirements.txt
├── frontend/                 # Next.js 15 + TypeScript
│   └── src/
│       ├── app/              # Pages (App Router)
│       │   ├── (auth)/       # Login, Register
│       │   └── (dashboard)/  # Dashboard, Tasks, Teams
│       ├── components/       # Reusable components
│       │   ├── ui/           # Modal, Toast, ConfirmDialog, UserAvatar
│       │   ├── dashboard/    # Charts, StatsCards
│       │   ├── layout/       # Sidebar, Header, ProfileModal
│       │   └── tasks/        # Task-specific components
│       ├── hooks/            # useTasks, useTeams
│       ├── lib/              # api, auth, theme, utils
│       └── types/            # TypeScript interfaces
├── .github/workflows/        # CI/CD pipelines
├── render.yaml               # Render deployment
└── README.md
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (JWT) |
| POST | `/api/auth/refresh/` | Refresh token |
| POST | `/api/auth/logout/` | Blacklist token |
| GET | `/api/auth/me/` | Get current user |
| PATCH | `/api/auth/me/` | Update profile |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/teams/` | List/Create teams |
| GET/PATCH/DELETE | `/api/teams/{id}/` | Team detail |
| POST | `/api/teams/{id}/invite/` | Invite member |
| DELETE | `/api/teams/{id}/members/{uid}/` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/tasks/` | List/Create tasks |
| GET/PATCH/DELETE | `/api/tasks/{id}/` | Task detail |
| GET/POST | `/api/tasks/{id}/comments/` | Comments |
| GET | `/api/tasks/{id}/activity/` | Activity log |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard/` | Overall stats |
| GET | `/api/analytics/status-distribution/` | Status breakdown |
| GET | `/api/analytics/priority-distribution/` | Priority breakdown |
| GET | `/api/analytics/team-productivity/` | Team stats |

---

## 🚢 Deployment

### Backend → Render

1. Push to GitHub
2. Connect repo to Render
3. Use `render.yaml` for service configuration
4. Set environment variables in Render dashboard

### Frontend → Vercel

1. Import repo to Vercel
2. Set root directory to `frontend`
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

---

## 📄 License

MIT License — feel free to use this project for learning, portfolios, or production.

---

Built with Django, Next.js, and ❤️
