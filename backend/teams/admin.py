from django.contrib import admin
from .models import Team, TeamMembership, TeamInvitation


class MembershipInline(admin.TabularInline):
    model = TeamMembership
    extra = 0


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    search_fields = ('name',)
    inlines = [MembershipInline]


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ('team', 'user', 'role', 'joined_at')
    list_filter = ('role',)


@admin.register(TeamInvitation)
class TeamInvitationAdmin(admin.ModelAdmin):
    list_display = ('team', 'email', 'status', 'created_at', 'expires_at')
    list_filter = ('status',)
