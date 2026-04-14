"""
Team views.
"""
import logging
import secrets
from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from tasks.models import ActivityLog
from .models import Team, TeamMembership, TeamInvitation
from .serializers import (
    TeamSerializer,
    TeamDetailSerializer,
    TeamMembershipSerializer,
    InviteMemberSerializer,
)

logger = logging.getLogger('teams')


class TeamViewSet(viewsets.ModelViewSet):
    """CRUD operations for teams."""

    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TeamDetailSerializer
        return TeamSerializer

    def get_queryset(self):
        """Only return teams the user is a member of."""
        return Team.objects.filter(
            memberships__user=self.request.user
        ).distinct()

    def perform_create(self, serializer):
        """Create a team and add the creator as owner."""
        team = serializer.save(owner=self.request.user)

        # Add creator as owner
        TeamMembership.objects.create(
            team=team,
            user=self.request.user,
            role=TeamMembership.Role.OWNER,
        )

        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            action=ActivityLog.ActionType.TEAM_CREATED,
            target_type='team',
            target_id=team.id,
            team=team,
            details={'team_name': team.name},
        )

        logger.info(f"Team created: {team.name} by {self.request.user.email}")

    def perform_destroy(self, instance):
        """Only owner can delete a team."""
        if instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the team owner can delete the team.")
        logger.info(f"Team deleted: {instance.name} by {self.request.user.email}")
        instance.delete()

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        """Invite a member to the team."""
        team = self.get_object()

        # Check if user is admin or owner
        membership = team.memberships.filter(user=request.user).first()
        if not membership or membership.role not in ('OWNER', 'ADMIN'):
            return Response(
                {'success': False, 'message': 'Only admins can invite members.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        # Check if already a member
        from users.models import User
        existing_user = User.objects.filter(email=email).first()
        if existing_user and team.memberships.filter(user=existing_user).exists():
            return Response(
                {'success': False, 'message': 'User is already a team member.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create invitation
        invitation = TeamInvitation.objects.create(
            team=team,
            email=email,
            invited_by=request.user,
            token=secrets.token_urlsafe(32),
            expires_at=timezone.now() + timedelta(days=7),
        )

        # If user exists, add them directly
        if existing_user:
            TeamMembership.objects.create(
                team=team,
                user=existing_user,
                role=serializer.validated_data.get('role', TeamMembership.Role.MEMBER),
            )
            invitation.status = TeamInvitation.Status.ACCEPTED
            invitation.save()

            ActivityLog.objects.create(
                user=request.user,
                action=ActivityLog.ActionType.MEMBER_JOINED,
                target_type='team',
                target_id=team.id,
                team=team,
                details={'member_email': email},
            )

            logger.info(f"Member added to team {team.name}: {email}")

            return Response(
                {'success': True, 'message': f'{email} has been added to the team.'},
                status=status.HTTP_200_OK,
            )

        logger.info(f"Invitation sent for team {team.name} to {email}")

        return Response(
            {'success': True, 'message': f'Invitation sent to {email}.'},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """List all members of a team."""
        team = self.get_object()
        memberships = team.memberships.select_related('user').all()
        serializer = TeamMembershipSerializer(memberships, many=True)
        return Response(
            {'success': True, 'data': serializer.data},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['delete'], url_path='members/(?P<user_id>[^/.]+)')
    def remove_member(self, request, pk=None, user_id=None):
        """Remove a member from the team."""
        team = self.get_object()

        # Check permissions
        requesting_membership = team.memberships.filter(user=request.user).first()
        if not requesting_membership or requesting_membership.role not in ('OWNER', 'ADMIN'):
            return Response(
                {'success': False, 'message': 'Only admins can remove members.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Cannot remove owner
        membership = team.memberships.filter(user_id=user_id).first()
        if not membership:
            return Response(
                {'success': False, 'message': 'User is not a team member.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if membership.role == 'OWNER':
            return Response(
                {'success': False, 'message': 'Cannot remove the team owner.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.ActionType.MEMBER_REMOVED,
            target_type='team',
            target_id=team.id,
            team=team,
            details={'removed_user': str(membership.user.email)},
        )

        membership.delete()

        return Response(
            {'success': True, 'message': 'Member removed.'},
            status=status.HTTP_200_OK,
        )
