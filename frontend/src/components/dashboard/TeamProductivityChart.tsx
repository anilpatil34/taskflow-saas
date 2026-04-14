'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { TeamProductivity } from '@/types';

interface Props {
  data: TeamProductivity[];
}

export default function TeamProductivityChart({ data }: Props) {
  const chartData = data.map((t) => ({
    name: t.name,
    completed: t.completed_tasks,
    total: t.total_tasks,
    rate: t.completion_rate,
  }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Team Productivity
      </h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-56 text-sm" style={{ color: 'var(--text-muted)' }}>
          No team data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
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
              <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
              <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>

          {/* Team stats list */}
          <div className="mt-4 space-y-2">
            {data.map((team) => (
              <div key={team.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-tertiary)' }}>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {team.name}
                  </span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                    {team.member_count} members
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>
                  {team.completion_rate}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
