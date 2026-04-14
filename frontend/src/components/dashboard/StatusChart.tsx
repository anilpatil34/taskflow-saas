'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { StatusDistribution } from '@/types';
import { getStatusLabel } from '@/lib/utils';

interface Props {
  data: StatusDistribution[];
}

const STATUS_COLORS: Record<string, string> = {
  TODO: '#64748b',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#f59e0b',
  DONE: '#10b981',
};

export default function StatusChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: getStatusLabel(d.status),
    value: d.count,
    color: STATUS_COLORS[d.status] || '#6366f1',
  }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Task Status Distribution
      </h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-56 text-sm" style={{ color: 'var(--text-muted)' }}>
          No task data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
