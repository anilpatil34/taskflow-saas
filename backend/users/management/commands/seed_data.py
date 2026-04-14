"""
Management command to seed the database with sample data.
"""
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import User
from teams.models import Team, TeamMembership
from tasks.models import Task, Comment, ActivityLog


class Command(BaseCommand):
    help = 'Seed the database with sample data for demo purposes.'

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding database...")

        # ── Create Users ──
        admin = User.objects.create_user(
            email='admin@taskflow.com',
            username='admin',
            first_name='Alex',
            last_name='Admin',
            password='admin123!',
            role=User.Role.ADMIN,
        )
        users = [admin]

        sample_users = [
            ('Sarah', 'Johnson', 'sarah@taskflow.com'),
            ('Mike', 'Chen', 'mike@taskflow.com'),
            ('Emily', 'Williams', 'emily@taskflow.com'),
            ('David', 'Brown', 'david@taskflow.com'),
            ('Lisa', 'Garcia', 'lisa@taskflow.com'),
        ]
        for first, last, email in sample_users:
            u = User.objects.create_user(
                email=email,
                username=email.split('@')[0],
                first_name=first,
                last_name=last,
                password='password123!',
            )
            users.append(u)

        self.stdout.write(f"  ✅ Created {len(users)} users")

        # ── Create Teams ──
        teams_data = [
            ('Engineering', 'Core product development team'),
            ('Design', 'UI/UX and product design team'),
            ('Marketing', 'Marketing and growth team'),
        ]
        teams = []
        for name, desc in teams_data:
            team = Team.objects.create(name=name, description=desc, owner=admin)
            TeamMembership.objects.create(team=team, user=admin, role=TeamMembership.Role.OWNER)
            # Add random members
            for u in random.sample(users[1:], k=min(3, len(users) - 1)):
                TeamMembership.objects.create(
                    team=team, user=u,
                    role=random.choice([TeamMembership.Role.ADMIN, TeamMembership.Role.MEMBER]),
                )
            teams.append(team)

        self.stdout.write(f"  ✅ Created {len(teams)} teams")

        # ── Create Tasks ──
        task_templates = [
            ('Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment'),
            ('Design landing page', 'Create wireframes and mockups for the new landing page'),
            ('Implement user auth', 'Add JWT-based authentication with refresh tokens'),
            ('Database optimization', 'Optimize slow queries and add proper indexing'),
            ('API documentation', 'Write comprehensive API docs with Swagger/OpenAPI'),
            ('Mobile responsive design', 'Ensure all pages are mobile-friendly'),
            ('Payment integration', 'Integrate Stripe for subscription billing'),
            ('Email templates', 'Design and implement transactional email templates'),
            ('Performance testing', 'Run load tests and optimize bottlenecks'),
            ('Security audit', 'Review codebase for security vulnerabilities'),
            ('User onboarding flow', 'Create guided onboarding for new users'),
            ('Analytics dashboard', 'Build real-time analytics with charts'),
            ('Search functionality', 'Implement full-text search across tasks'),
            ('File upload feature', 'Add file attachments to tasks'),
            ('Notification system', 'Build in-app notification center'),
        ]

        statuses = [Task.Status.TODO, Task.Status.IN_PROGRESS, Task.Status.IN_REVIEW, Task.Status.DONE]
        priorities = [Task.Priority.LOW, Task.Priority.MEDIUM, Task.Priority.HIGH, Task.Priority.URGENT]
        tags_pool = ['frontend', 'backend', 'devops', 'design', 'bug', 'feature', 'urgent', 'docs']

        tasks_created = 0
        for team in teams:
            members = list(team.memberships.values_list('user', flat=True))
            for title, desc in random.sample(task_templates, k=min(8, len(task_templates))):
                task_status = random.choice(statuses)
                deadline = timezone.now() + timedelta(days=random.randint(-5, 30))

                task = Task.objects.create(
                    title=title,
                    description=desc,
                    team=team,
                    creator=admin,
                    assignee_id=random.choice(members) if members else None,
                    status=task_status,
                    priority=random.choice(priorities),
                    deadline=deadline,
                    tags=','.join(random.sample(tags_pool, k=random.randint(1, 3))),
                    order=tasks_created,
                )

                # Add some comments
                for _ in range(random.randint(0, 3)):
                    Comment.objects.create(
                        task=task,
                        author_id=random.choice(members),
                        content=random.choice([
                            "Working on this now.",
                            "Need more details on the requirements.",
                            "This is blocked by the API changes.",
                            "Almost done, will submit for review soon.",
                            "Looks good! Ready for QA.",
                            "Can we schedule a quick sync about this?",
                        ]),
                    )

                # Log activity
                ActivityLog.objects.create(
                    user=admin,
                    action=ActivityLog.ActionType.TASK_CREATED,
                    target_type='task',
                    target_id=task.id,
                    team=team,
                    details={'task_title': title},
                )

                tasks_created += 1

        self.stdout.write(f"  ✅ Created {tasks_created} tasks with comments")

        self.stdout.write(self.style.SUCCESS(
            f"\n🎉 Seeding complete!\n"
            f"   Admin login: admin@taskflow.com / admin123!\n"
            f"   Member login: sarah@taskflow.com / password123!"
        ))
