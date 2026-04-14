'use client';

import type { DashboardStats } from '@/types';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  ListTodo,
  Loader,
  Target,
} from 'lucide-react';

interface Props {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total Tasks',
      value: stats.total_tasks,
      icon: ListTodo,
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.1)',
    },
    {
      label: 'Completed',
      value: stats.completed_tasks,
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: Loader,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completion_rate}%`,
      icon: TrendingUp,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.1)',
    },
    {
      label: 'My Tasks',
      value: stats.my_tasks,
      icon: Target,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
    },
    {
      label: 'In Review',
      value: stats.in_review,
      icon: Clock,
      color: '#f97316',
      bg: 'rgba(249,115,22,0.1)',
    },
    {
      label: 'Teams',
      value: stats.total_teams,
      icon: Users,
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.1)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
      {cards.map((card, i) => (
        <div key={i} className="glass-card glass-card-hover p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: card.bg, color: card.color }}>
            <card.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider truncate mb-0.5" style={{ color: 'var(--text-muted)' }}>
              {card.label}
            </p>
            <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
