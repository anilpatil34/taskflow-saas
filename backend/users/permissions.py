"""
Custom permissions for role-based access control.
"""
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only allow users with ADMIN role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class IsTeamMember(BasePermission):
    """Only allow members of the team."""

    def has_object_permission(self, request, view, obj):
        # obj is the Team itself
        return obj.memberships.filter(user=request.user).exists()


class IsTeamAdminOrOwner(BasePermission):
    """Only allow team admins or owners."""

    def has_object_permission(self, request, view, obj):
        membership = obj.memberships.filter(user=request.user).first()
        if not membership:
            return False
        return membership.role in ('OWNER', 'ADMIN')


class IsTaskCreatorOrAssignee(BasePermission):
    """Only allow the task creator or assignee to modify."""

    def has_object_permission(self, request, view, obj):
        return (
            obj.creator == request.user
            or obj.assignee == request.user
        )
