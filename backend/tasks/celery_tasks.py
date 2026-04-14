"""
Celery background tasks for TaskFlow.
"""
import logging
from datetime import timedelta
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger('tasks')


@shared_task(name='tasks.celery_tasks.send_task_assignment_email')
def send_task_assignment_email(task_id):
    """Send email notification when a task is assigned to a user."""
    from tasks.models import Task

    try:
        task = Task.objects.select_related('assignee', 'creator', 'team').get(id=task_id)
        if not task.assignee or not task.assignee.email:
            return "No assignee or email."

        subject = f"[TaskFlow] New task assigned: {task.title}"
        message = (
            f"Hi {task.assignee.first_name},\n\n"
            f"You have been assigned a new task:\n\n"
            f"Title: {task.title}\n"
            f"Team: {task.team.name}\n"
            f"Priority: {task.get_priority_display()}\n"
            f"Deadline: {task.deadline.strftime('%Y-%m-%d %H:%M') if task.deadline else 'Not set'}\n"
            f"Assigned by: {task.creator.full_name}\n\n"
            f"View task: {settings.FRONTEND_URL}/tasks/{task.id}\n\n"
            f"— TaskFlow"
        )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [task.assignee.email],
            fail_silently=False,
        )

        logger.info(f"Assignment email sent to {task.assignee.email} for task {task.title}")
        return f"Email sent to {task.assignee.email}"

    except Exception as e:
        logger.error(f"Failed to send assignment email for task {task_id}: {e}")
        raise


@shared_task(name='tasks.celery_tasks.send_deadline_reminders')
def send_deadline_reminders():
    """Send email reminders for tasks due within 24 hours."""
    from tasks.models import Task

    now = timezone.now()
    deadline_threshold = now + timedelta(hours=24)

    tasks_due_soon = Task.objects.filter(
        deadline__gte=now,
        deadline__lte=deadline_threshold,
        status__in=[Task.Status.TODO, Task.Status.IN_PROGRESS, Task.Status.IN_REVIEW],
        assignee__isnull=False,
    ).select_related('assignee', 'team')

    count = 0
    for task in tasks_due_soon:
        try:
            subject = f"[TaskFlow] Deadline approaching: {task.title}"
            message = (
                f"Hi {task.assignee.first_name},\n\n"
                f"This is a reminder that the following task is due soon:\n\n"
                f"Title: {task.title}\n"
                f"Team: {task.team.name}\n"
                f"Deadline: {task.deadline.strftime('%Y-%m-%d %H:%M UTC')}\n"
                f"Status: {task.get_status_display()}\n\n"
                f"View task: {settings.FRONTEND_URL}/tasks/{task.id}\n\n"
                f"— TaskFlow"
            )

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [task.assignee.email],
                fail_silently=True,
            )
            count += 1
        except Exception as e:
            logger.error(f"Failed to send reminder for task {task.id}: {e}")

    logger.info(f"Sent {count} deadline reminder emails")
    return f"Sent {count} reminders"


@shared_task(name='tasks.celery_tasks.check_overdue_tasks')
def check_overdue_tasks():
    """Check for overdue tasks and send notifications."""
    from tasks.models import Task

    now = timezone.now()

    overdue_tasks = Task.objects.filter(
        deadline__lt=now,
        status__in=[Task.Status.TODO, Task.Status.IN_PROGRESS, Task.Status.IN_REVIEW],
        assignee__isnull=False,
    ).select_related('assignee', 'team')

    count = 0
    for task in overdue_tasks:
        try:
            subject = f"[TaskFlow] OVERDUE: {task.title}"
            message = (
                f"Hi {task.assignee.first_name},\n\n"
                f"The following task is overdue:\n\n"
                f"Title: {task.title}\n"
                f"Team: {task.team.name}\n"
                f"Deadline was: {task.deadline.strftime('%Y-%m-%d %H:%M UTC')}\n"
                f"Status: {task.get_status_display()}\n\n"
                f"Please update the task status or request a deadline extension.\n\n"
                f"View task: {settings.FRONTEND_URL}/tasks/{task.id}\n\n"
                f"— TaskFlow"
            )

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [task.assignee.email],
                fail_silently=True,
            )
            count += 1
        except Exception as e:
            logger.error(f"Failed to send overdue notice for task {task.id}: {e}")

    logger.info(f"Sent {count} overdue task notifications")
    return f"Sent {count} overdue notifications"
