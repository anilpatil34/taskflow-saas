'use client';

import type { ActivityLog } from '@/types';
import { timeAgo, getInitials } from '@/lib/utils';
import {
  CheckCircle,
  PlusCircle,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  MessageSquare,
  ArrowRightLeft,
  Layers,
} from 'lucide-react';

interface Props {
  logs: ActivityLog[];
}

const ACTION_CONFIG: Record<string, { icon: typeof CheckCircle; color: string }> = {
  TASK_CREATED: { icon: PlusCircle, color: '#10b981' },
  TASK_UPDATED: { icon: Edit, color: '#3b82f6' },
  TASK_DELETED: { icon: Trash2, color: '#ef4444' },
  TASK_ASSIGNED: { icon: UserPlus, color: '#8b5cf6' },
  STATUS_CHANGED: { icon: ArrowRightLeft, color: '#f59e0b' },
  COMMENT_ADDED: { icon: MessageSquare, color: '#06b6d4' },
  MEMBER_JOINED: { icon: UserPlus, color: '#10b981' },
  MEMBER_REMOVED: { icon: UserMinus, color: '#ef4444' },
  TEAM_CREATED: { icon: Layers, color: '#6366f1' },
};

export default function RecentActivity({ logs }: Props) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Recent Activity
      </h3>

      {logs.length === 0 ? (
        <div className="flex items-center justify-center h-56 text-sm" style={{ color: 'var(--text-muted)' }}>
          No recent activity
        </div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
          {logs.slice(0, 15).map((log) => {
            const config = ACTION_CONFIG[log.action] || { icon: CheckCircle, color: '#6366f1' };
            const Icon = config.icon;
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${config.color}15`, color: config.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-medium">{log.user?.full_name || 'Unknown'}</span>
                    {' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {log.action.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </p>
                  {log.details?.task_title && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {log.details.task_title}
                    </p>
                  )}
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(log.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
