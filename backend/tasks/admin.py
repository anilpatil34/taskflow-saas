from django.contrib import admin
from .models import Task, Comment, ActivityLog


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'team', 'assignee', 'status', 'priority', 'deadline', 'created_at')
    list_filter = ('status', 'priority', 'team')
    search_fields = ('title', 'description')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'created_at')
    list_filter = ('created_at',)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'target_type', 'timestamp')
    list_filter = ('action', 'target_type')
    search_fields = ('user__email',)
