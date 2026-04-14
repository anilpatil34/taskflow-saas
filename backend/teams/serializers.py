"""
Team serializers.
"""
from rest_framework import serializers
from .models import Team, TeamMembership, TeamInvitation
from users.serializers import UserSerializer


class TeamMembershipSerializer(serializers.ModelSerializer):
    """Serializer for team membership."""

    user = UserSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        fields = ('id', 'user', 'role', 'joined_at')
        read_only_fields = ('id', 'joined_at')


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for team listing."""

    owner = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = (
            'id', 'name', 'description', 'owner', 'avatar',
            'member_count', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

    def get_member_count(self, obj):
        return obj.memberships.count()


class TeamDetailSerializer(serializers.ModelSerializer):
    """Detailed team serializer with members."""

    owner = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = (
            'id', 'name', 'description', 'owner', 'avatar',
            'members', 'task_count', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

    def get_members(self, obj):
        memberships = obj.memberships.select_related('user').all()
        return TeamMembershipSerializer(memberships, many=True).data

    def get_task_count(self, obj):
        return obj.tasks.count()


class TeamInvitationSerializer(serializers.ModelSerializer):
    """Serializer for team invitations."""

    invited_by = UserSerializer(read_only=True)

    class Meta:
        model = TeamInvitation
        fields = ('id', 'team', 'email', 'invited_by', 'status', 'created_at', 'expires_at')
        read_only_fields = ('id', 'team', 'invited_by', 'status', 'created_at', 'expires_at')


class InviteMemberSerializer(serializers.Serializer):
    """Serializer for inviting a member."""

    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=TeamMembership.Role.choices,
        default=TeamMembership.Role.MEMBER,
    )
