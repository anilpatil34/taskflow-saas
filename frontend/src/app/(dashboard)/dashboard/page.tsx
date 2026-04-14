'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type {
  DashboardStats,
  StatusDistribution,
  PriorityDistribution,
  TeamProductivity,
  ActivityLog,
} from '@/types';
import StatsCards from '@/components/dashboard/StatsCards';
import StatusChart from '@/components/dashboard/StatusChart';
import PriorityChart from '@/components/dashboard/PriorityChart';
import TeamProductivityChart from '@/components/dashboard/TeamProductivityChart';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([]);
  const [priorityDist, setPriorityDist] = useState<PriorityDistribution[]>([]);
  const [teamProd, setTeamProd] = useState<TeamProductivity[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, statusRes, priorityRes, teamRes, activityRes] = await Promise.all([
          api.get('/api/analytics/dashboard/'),
          api.get('/api/analytics/status-distribution/'),
          api.get('/api/analytics/priority-distribution/'),
          api.get('/api/analytics/team-productivity/'),
          api.get('/api/tasks/activity-logs/'),
        ]);
        setStats(statsRes.data.data);
        setStatusDist(statusRes.data.data);
        setPriorityDist(priorityRes.data.data);
        setTeamProd(teamRes.data.data);
        setActivity(activityRes.data.data || activityRes.data.results || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: 'var(--text-muted)' }}>
          Overview of your tasks and team productivity
        </p>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <StatusChart data={statusDist} />
        <PriorityChart data={priorityDist} />
      </div>

      {/* Team Productivity & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TeamProductivityChart data={teamProd} />
        <RecentActivity logs={activity} />
      </div>
    </div>
  );
}
