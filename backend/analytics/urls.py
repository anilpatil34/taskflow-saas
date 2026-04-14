"""
Analytics URL routing.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardStatsView.as_view(), name='analytics-dashboard'),
    path('status-distribution/', views.StatusDistributionView.as_view(), name='analytics-status'),
    path('priority-distribution/', views.PriorityDistributionView.as_view(), name='analytics-priority'),
    path('productivity/', views.ProductivityView.as_view(), name='analytics-productivity'),
    path('team-productivity/', views.TeamProductivityView.as_view(), name='analytics-team'),
]
