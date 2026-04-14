import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    TODO: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    IN_REVIEW: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    DONE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };
  return colors[status] || colors.TODO;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
  };
  return labels[status] || status;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'bg-slate-500/20 text-slate-300',
    MEDIUM: 'bg-blue-500/20 text-blue-300',
    HIGH: 'bg-orange-500/20 text-orange-300',
    URGENT: 'bg-red-500/20 text-red-300',
  };
  return colors[priority] || colors.MEDIUM;
}

export function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    LOW: '↓',
    MEDIUM: '→',
    HIGH: '↑',
    URGENT: '⚡',
  };
  return icons[priority] || '→';
}
