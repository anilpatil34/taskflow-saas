"""
Task serializers.
"""
from rest_framework import serializers
from .models import Task, Comment, ActivityLog
from users.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for task comments."""

    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'task', 'author', 'content', 'created_at', 'updated_at')
        read_only_fields = ('id', 'task', 'author', 'created_at', 'updated_at')


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for task listing."""

    assignee = UserSerializer(read_only=True)
    creator = UserSerializer(read_only=True)
    assignee_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    is_overdue = serializers.ReadOnlyField()
    tag_list = serializers.ReadOnlyField()
    comment_count = serializers.SerializerMethodField()
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'team', 'team_name',
            'assignee', 'assignee_id', 'creator',
            'status', 'priority', 'deadline', 'tags', 'tag_list',
            'order', 'is_overdue', 'comment_count',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'creator', 'created_at', 'updated_at')

    def get_comment_count(self, obj):
        return obj.comments.count()


class TaskDetailSerializer(TaskSerializer):
    """Detailed task serializer with comments."""

    comments = CommentSerializer(many=True, read_only=True)

    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ('comments',)


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for activity logs."""

    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ('id', 'user', 'action', 'target_type', 'target_id', 'details', 'timestamp')
        read_only_fields = ('id', 'user', 'action', 'target_type', 'target_id', 'details', 'timestamp')


class TaskBulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk updating task order/status (Kanban drag & drop)."""

    tasks = serializers.ListField(
        child=serializers.DictField(), min_length=1
    )
