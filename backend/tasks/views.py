"""
Task views.
"""
import logging
from django.db.models import Q
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Task, Comment, ActivityLog
from .serializers import (
    TaskSerializer,
    TaskDetailSerializer,
    CommentSerializer,
    ActivityLogSerializer,
    TaskBulkUpdateSerializer,
)

logger = logging.getLogger('tasks')


class TaskViewSet(viewsets.ModelViewSet):
    """Full CRUD for tasks with filtering."""

    permission_classes = (IsAuthenticated,)
    filterset_fields = ['status', 'priority', 'team', 'assignee']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'deadline', 'priority', 'order']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TaskDetailSerializer
        return TaskSerializer

    def get_queryset(self):
        """Return tasks from teams the user belongs to."""
        user = self.request.user
        queryset = Task.objects.filter(
            team__memberships__user=user
        ).select_related('team', 'assignee', 'creator').distinct()

        # Optional query params for filtering
        team_id = self.request.query_params.get('team')
        assignee_id = self.request.query_params.get('assignee')
        task_status = self.request.query_params.get('status')

        if team_id:
            queryset = queryset.filter(team_id=team_id)
        if assignee_id:
            queryset = queryset.filter(assignee_id=assignee_id)
        if task_status:
            queryset = queryset.filter(status=task_status)

        return queryset

    def perform_create(self, serializer):
        """Create a task and log the activity."""
        assignee_id = serializer.validated_data.pop('assignee_id', None)
        task = serializer.save(
            creator=self.request.user,
            assignee_id=assignee_id,
        )

        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.ActionType.TASK_CREATED,
            target_type='task',
            target_id=task.id,
            team=task.team,
            details={'task_title': task.title},
        )

        # Send assignment email if assigned
        if assignee_id:
            ActivityLog.objects.create(
                user=self.request.user,
                action=ActivityLog.ActionType.TASK_ASSIGNED,
                target_type='task',
                target_id=task.id,
                team=task.team,
                details={
                    'task_title': task.title,
                    'assignee_id': str(assignee_id),
                },
            )
            # Trigger Celery task
            try:
                from .celery_tasks import send_task_assignment_email
                send_task_assignment_email.delay(str(task.id))
            except Exception as e:
                logger.warning(f"Failed to queue assignment email: {e}")

        logger.info(f"Task created: {task.title} by {self.request.user.email}")

    def perform_update(self, serializer):
        """Update a task and track changes."""
        old_status = serializer.instance.status
        old_assignee = serializer.instance.assignee_id

        assignee_id = serializer.validated_data.pop('assignee_id', None)
        if assignee_id is not None:
            task = serializer.save(assignee_id=assignee_id)
        else:
            task = serializer.save()

        # Log status changes
        if task.status != old_status:
            ActivityLog.objects.create(
                user=self.request.user,
                action=ActivityLog.ActionType.STATUS_CHANGED,
                target_type='task',
                target_id=task.id,
                team=task.team,
                details={
                    'task_title': task.title,
                    'old_status': old_status,
                    'new_status': task.status,
                },
            )

        # Log assignment changes
        if task.assignee_id != old_assignee:
            ActivityLog.objects.create(
                user=self.request.user,
                action=ActivityLog.ActionType.TASK_ASSIGNED,
                target_type='task',
                target_id=task.id,
                team=task.team,
                details={
                    'task_title': task.title,
                    'assignee_id': str(task.assignee_id),
                },
            )

        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.ActionType.TASK_UPDATED,
            target_type='task',
            target_id=task.id,
            team=task.team,
            details={'task_title': task.title},
        )

        logger.info(f"Task updated: {task.title} by {self.request.user.email}")

    def perform_destroy(self, instance):
        """Delete a task and log."""
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.ActionType.TASK_DELETED,
            target_type='task',
            target_id=instance.id,
            team=instance.team,
            details={'task_title': instance.title},
        )
        logger.info(f"Task deleted: {instance.title} by {self.request.user.email}")
        instance.delete()

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        """List or add comments to a task."""
        task = self.get_object()

        if request.method == 'GET':
            comments = task.comments.select_related('author').all()
            serializer = CommentSerializer(comments, many=True)
            return Response(
                {'success': True, 'data': serializer.data},
                status=status.HTTP_200_OK,
            )

        # POST - add comment
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(task=task, author=request.user)

        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.ActionType.COMMENT_ADDED,
            target_type='task',
            target_id=task.id,
            team=task.team,
            details={'task_title': task.title, 'comment_preview': comment.content[:100]},
        )

        return Response(
            {'success': True, 'data': CommentSerializer(comment).data},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Get activity log for a task."""
        task = self.get_object()
        logs = ActivityLog.objects.filter(
            target_type='task', target_id=task.id
        ).select_related('user')[:50]
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(
            {'success': True, 'data': serializer.data},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='bulk-update')
    def bulk_update(self, request):
        """Bulk update task order and status (for Kanban drag & drop)."""
        serializer = TaskBulkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        for task_data in serializer.validated_data['tasks']:
            task_id = task_data.get('id')
            try:
                task = Task.objects.get(id=task_id)
                if 'order' in task_data:
                    task.order = task_data['order']
                if 'status' in task_data:
                    task.status = task_data['status']
                task.save(update_fields=['order', 'status', 'updated_at'])
            except Task.DoesNotExist:
                continue

        return Response(
            {'success': True, 'message': 'Tasks updated.'},
            status=status.HTTP_200_OK,
        )


class ActivityLogListView(generics.ListAPIView):
    """List activity logs for a team."""

    serializer_class = ActivityLogSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        team_id = self.request.query_params.get('team')
        queryset = ActivityLog.objects.filter(
            Q(team__memberships__user=self.request.user)
        ).select_related('user').distinct()

        if team_id:
            queryset = queryset.filter(team_id=team_id)

        return queryset[:100]
