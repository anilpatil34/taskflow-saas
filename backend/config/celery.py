"""
Celery configuration for TaskFlow SaaS.
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

app = Celery('taskflow')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# ─── Periodic Tasks (Celery Beat) ────────────────────────
app.conf.beat_schedule = {
    'check-overdue-tasks': {
        'task': 'tasks.celery_tasks.check_overdue_tasks',
        'schedule': crontab(minute=0, hour='*/1'),  # Every hour
    },
    'send-deadline-reminders': {
        'task': 'tasks.celery_tasks.send_deadline_reminders',
        'schedule': crontab(minute=0, hour='8'),  # Daily at 8 AM UTC
    },
}
