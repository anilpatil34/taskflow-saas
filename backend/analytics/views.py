"""
Analytics views — dashboard stats, charts, productivity metrics.
"""
from datetime import timedelta
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.models import Task, ActivityLog
from teams.models import Team


class DashboardStatsView(APIView):
    """Overview dashboard statistics."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        user_teams = Team.objects.filter(memberships__user=user)
        tasks = Task.objects.filter(team__in=user_teams)

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status=Task.Status.DONE).count()
        in_progress = tasks.filter(status=Task.Status.IN_PROGRESS).count()
        todo = tasks.filter(status=Task.Status.TODO).count()
        in_review = tasks.filter(status=Task.Status.IN_REVIEW).count()
        overdue = tasks.filter(
            deadline__lt=timezone.now(),
            status__in=[Task.Status.TODO, Task.Status.IN_PROGRESS, Task.Status.IN_REVIEW],
        ).count()

        my_tasks = tasks.filter(assignee=user).count()
        my_completed = tasks.filter(assignee=user, status=Task.Status.DONE).count()

        completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0

        return Response({
            'success': True,
            'data': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'in_progress': in_progress,
                'todo': todo,
                'in_review': in_review,
                'overdue': overdue,
                'my_tasks': my_tasks,
                'my_completed': my_completed,
                'completion_rate': completion_rate,
                'total_teams': user_teams.count(),
            },
        })


class StatusDistributionView(APIView):
    """Task counts by status for pie chart."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        user_teams = Team.objects.filter(memberships__user=user)

        queryset = Task.objects.filter(team__in=user_teams)
        team_id = request.query_params.get('team')
        if team_id:
            queryset = queryset.filter(team_id=team_id)

        distribution = queryset.values('status').annotate(count=Count('id'))

        return Response({
            'success': True,
            'data': list(distribution),
        })


class PriorityDistributionView(APIView):
    """Task counts by priority for chart."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        user_teams = Team.objects.filter(memberships__user=user)

        queryset = Task.objects.filter(team__in=user_teams)
        team_id = request.query_params.get('team')
        if team_id:
            queryset = queryset.filter(team_id=team_id)

        distribution = queryset.values('priority').annotate(count=Count('id'))

        return Response({
            'success': True,
            'data': list(distribution),
        })


class ProductivityView(APIView):
    """Tasks completed per day over the last 30 days for line chart."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        user_teams = Team.objects.filter(memberships__user=user)
        days = int(request.query_params.get('days', 30))

        start_date = timezone.now() - timedelta(days=days)

        # Get task completion activity
        completed_tasks = (
            ActivityLog.objects.filter(
                team__in=user_teams,
                action=ActivityLog.ActionType.STATUS_CHANGED,
                timestamp__gte=start_date,
                details__new_status='DONE',
            )
            .extra(select={'date': "DATE(timestamp)"})
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        # Get task creation
        created_tasks = (
            ActivityLog.objects.filter(
                team__in=user_teams,
                action=ActivityLog.ActionType.TASK_CREATED,
                timestamp__gte=start_date,
            )
            .extra(select={'date': "DATE(timestamp)"})
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        return Response({
            'success': True,
            'data': {
                'completed': list(completed_tasks),
                'created': list(created_tasks),
            },
        })


class TeamProductivityView(APIView):
    """Task stats per team for comparison."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        user_teams = Team.objects.filter(memberships__user=user)

        team_stats = []
        for team in user_teams:
            total = team.tasks.count()
            done = team.tasks.filter(status=Task.Status.DONE).count()
            rate = round((done / total * 100), 1) if total > 0 else 0
            team_stats.append({
                'id': str(team.id),
                'name': team.name,
                'total_tasks': total,
                'completed_tasks': done,
                'completion_rate': rate,
                'member_count': team.memberships.count(),
            })

        return Response({
            'success': True,
            'data': team_stats,
        })
