"""
Task models for TaskFlow.
"""
import uuid
from django.db import models
from django.conf import settings


class Task(models.Model):
    """A task within a team project."""

    class Status(models.TextChoices):
        TODO = 'TODO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        DONE = 'DONE', 'Done'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, default='')
    team = models.ForeignKey(
        'teams.Team',
        on_delete=models.CASCADE,
        related_name='tasks',
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks',
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tasks',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    deadline = models.DateTimeField(null=True, blank=True)
    tags = models.CharField(max_length=500, blank=True, default='')  # Comma-separated
    order = models.IntegerField(default=0)  # For Kanban ordering
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

    @property
    def is_overdue(self):
        from django.utils import timezone
        if self.deadline and self.status != self.Status.DONE:
            return self.deadline < timezone.now()
        return False

    @property
    def tag_list(self):
        if self.tags:
            return [t.strip() for t in self.tags.split(',') if t.strip()]
        return []


class Comment(models.Model):
    """Comments on tasks."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='task_comments',
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.email} on {self.task.title}"


class ActivityLog(models.Model):
    """Tracks all user actions for audit trail."""

    class ActionType(models.TextChoices):
        TASK_CREATED = 'TASK_CREATED', 'Task Created'
        TASK_UPDATED = 'TASK_UPDATED', 'Task Updated'
        TASK_DELETED = 'TASK_DELETED', 'Task Deleted'
        TASK_ASSIGNED = 'TASK_ASSIGNED', 'Task Assigned'
        STATUS_CHANGED = 'STATUS_CHANGED', 'Status Changed'
        COMMENT_ADDED = 'COMMENT_ADDED', 'Comment Added'
        MEMBER_JOINED = 'MEMBER_JOINED', 'Member Joined'
        MEMBER_REMOVED = 'MEMBER_REMOVED', 'Member Removed'
        TEAM_CREATED = 'TEAM_CREATED', 'Team Created'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_logs',
    )
    action = models.CharField(max_length=30, choices=ActionType.choices)
    target_type = models.CharField(max_length=50)  # e.g., 'task', 'team'
    target_id = models.UUIDField()
    team = models.ForeignKey(
        'teams.Team',
        on_delete=models.CASCADE,
        related_name='activity_logs',
        null=True,
        blank=True,
    )
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email} - {self.action} at {self.timestamp}"
