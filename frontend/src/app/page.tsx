'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import {
  CheckCircle,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  Layers,
  Shield,
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ─── Hero Gradient Background ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[300px] sm:h-[400px] lg:h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, var(--gradient-start), transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[200px] sm:w-[300px] lg:w-[400px] h-[200px] sm:h-[300px] lg:h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, var(--gradient-end), transparent 70%)' }} />
      </div>

      {/* ─── Nav ─── */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 sm:py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold gradient-text">TaskFlow</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login"
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}>
            Sign In
          </Link>
          <Link href="/register" className="gradient-btn text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium mb-4 sm:mb-6"
            style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
            <Zap className="w-3 h-3" /> Now in public beta — Free for teams up to 10
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-4 sm:mb-6">
            <span style={{ color: 'var(--text-primary)' }}>Manage tasks</span>
            <br />
            <span className="gradient-text">like never before</span>
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
            style={{ color: 'var(--text-secondary)' }}>
            TaskFlow is a smart task management platform built for modern teams.
            Track progress, collaborate in real-time, and ship faster with
            Kanban boards, analytics, and automated reminders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/register" className="gradient-btn text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 flex items-center gap-2 w-full sm:w-auto justify-center">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all glass-card glass-card-hover flex items-center gap-2 w-full sm:w-auto justify-center"
              style={{ color: 'var(--text-primary)' }}>
              View demo
            </Link>
          </div>
        </div>

        {/* ─── Features Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-16 sm:mt-28 stagger-children">
          {[
            {
              icon: CheckCircle,
              title: 'Kanban & List Views',
              desc: 'Organize tasks your way with drag-and-drop Kanban boards or classic list views. Set priorities, deadlines, and assignees.',
              color: '#10b981',
            },
            {
              icon: BarChart3,
              title: 'Real-time Analytics',
              desc: 'Track completion rates, team productivity, and task distribution with beautiful, interactive charts and dashboards.',
              color: '#6366f1',
            },
            {
              icon: Users,
              title: 'Team Collaboration',
              desc: 'Create teams, assign roles, invite members, and keep everyone aligned with activity feeds and notifications.',
              color: '#f59e0b',
            },
            {
              icon: Zap,
              title: 'Smart Reminders',
              desc: 'Never miss a deadline. Automated email notifications for approaching deadlines and overdue tasks.',
              color: '#ef4444',
            },
            {
              icon: Shield,
              title: 'Role-Based Access',
              desc: 'Fine-grained permissions with Admin and Member roles. Control who can manage teams, tasks, and settings.',
              color: '#8b5cf6',
            },
            {
              icon: Layers,
              title: 'Activity Timeline',
              desc: 'Full audit trail of all changes. See who did what, when, and track the entire history of every task.',
              color: '#3b82f6',
            },
          ].map((feature, i) => (
            <div key={i} className="glass-card glass-card-hover p-5 sm:p-7">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
                style={{ background: `${feature.color}15`, color: feature.color }}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Footer ─── */}
        <footer className="text-center mt-16 sm:mt-28 pb-6 sm:pb-8">
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} TaskFlow. Built with Django, Next.js, and ❤️
          </p>
        </footer>
      </main>
    </div>
  );
}
