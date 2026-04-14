'use client';

import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { Sun, Moon, Bell, Search, X, ExternalLink, Clock, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getInitials, timeAgo } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import ProfileModal from './ProfileModal';
import api from '@/lib/api';
import Link from 'next/link';
import type { Task, ActivityLog } from '@/types';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  // ─── Search State ───
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ─── Notifications State ───
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<ActivityLog[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // ─── Profile Modal ───
  const [profileOpen, setProfileOpen] = useState(false);

  // ─── Click outside to close ───
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ─── Search handler with debounce ───
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/api/tasks/?search=${encodeURIComponent(searchQuery)}`);
        const tasks = res.data.results || res.data;
        setSearchResults(Array.isArray(tasks) ? tasks.slice(0, 8) : []);
        setSearchOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Fetch notifications ───
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get('/api/tasks/activity-logs/');
      const logs = res.data.data || res.data.results || [];
      setNotifications(Array.isArray(logs) ? logs.slice(0, 15) : []);
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleNotifToggle = () => {
    if (!notifOpen) fetchNotifications();
    setNotifOpen(!notifOpen);
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* ─── Left Actions & Search ─── */}
        <div className="flex items-center flex-1 max-w-md gap-3" ref={searchRef}>
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: searchQuery ? 'var(--accent)' : 'var(--text-muted)' }}
            />
            <input
              id="header-search"
              type="text"
              placeholder="Search tasks..."
              className="input-field pl-10 pr-10 py-2.5 text-sm"
              style={{ background: 'var(--bg-tertiary)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {searchOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-2 glass-card py-2 max-h-80 overflow-y-auto animate-scale-in z-50"
              >
                {searching ? (
                  <div className="px-4 py-6 text-center">
                    <div
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                      style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                    />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                    No tasks found for &quot;{searchQuery}&quot;
                  </p>
                ) : (
                  searchResults.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 px-4 py-3 transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {task.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {task.team_name} · {task.status.replace('_', ' ')}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Actions ─── */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-3">
          {/* Theme Toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              id="notifications-btn"
              onClick={handleNotifToggle}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative transition-all duration-200"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: 'var(--danger)', borderColor: 'var(--bg-secondary)' }}
                />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 glass-card animate-scale-in z-50 max-h-96 overflow-hidden flex flex-col">
                <div
                  className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Activity
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                    {notifications.length}
                  </span>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div
                        className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                      />
                    </div>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-8 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                      No recent activity
                    </p>
                  ) : (
                    notifications.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 px-4 py-3 transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <UserAvatar name={log.user?.full_name || 'User'} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {log.user?.full_name}
                            </span>{' '}
                            {log.action.replace(/_/g, ' ').toLowerCase()}
                          </p>
                          <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar (opens profile) */}
          <button
            onClick={() => setProfileOpen(true)}
            className="ml-1 cursor-pointer transition-transform hover:scale-105"
            title="Edit Profile"
          >
            <UserAvatar
              name={user?.full_name || '?'}
              avatar={user?.avatar}
              size="sm"
              className="sm:w-9 sm:h-9"
            />
          </button>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
