'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PriorityDistribution } from '@/types';

interface Props {
  data: PriorityDistribution[];
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#64748b',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};

const LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export default function PriorityChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: LABELS[d.priority] || d.priority,
    value: d.count,
    color: PRIORITY_COLORS[d.priority] || '#6366f1',
  }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Task Priority Breakdown
      </h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-56 text-sm" style={{ color: 'var(--text-muted)' }}>
          No task data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barCategoryGap="30%">
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
