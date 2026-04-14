'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import type { TaskDetail, Comment, ActivityLog, TaskStatus, TaskPriority } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  ArrowLeft, Edit, Trash2, Send, Calendar, Tag,
  AlertCircle, MessageSquare, Clock, User as UserIcon,
  CheckCircle, Layers,
} from 'lucide-react';
import {
  getStatusColor, getStatusLabel, getPriorityColor,
  getPriorityIcon, formatDate, formatDateTime, timeAgo, getInitials,
} from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '' as TaskStatus,
    priority: '' as TaskPriority,
    deadline: '',
  });

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const [taskRes, activityRes] = await Promise.all([
        api.get(`/api/tasks/${id}/`),
        api.get(`/api/tasks/${id}/activity/`),
      ]);
      const taskData = taskRes.data.results ? taskRes.data.results : taskRes.data;
      setTask(taskData);
      setActivity(activityRes.data.data || []);
      setEditForm({
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status,
        priority: taskData.priority,
        deadline: taskData.deadline ? taskData.deadline.slice(0, 16) : '',
      });
    } catch {
      router.push('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSendingComment(true);
    try {
      await api.post(`/api/tasks/${id}/comments/`, { content: newComment });
      setNewComment('');
      fetchTask();
      toast('Comment added', 'success');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast('Failed to add comment', 'error');
    } finally {
      setSendingComment(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/api/tasks/${id}/`, {
        ...editForm,
        deadline: editForm.deadline || null,
      });
      setEditing(false);
      fetchTask();
      toast('Task updated', 'success');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast('Failed to update task', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/tasks/${id}/`);
      toast('Task deleted', 'success');
      router.push('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast('Failed to delete task', 'error');
    }
  };

  const handleQuickStatus = async (status: TaskStatus) => {
    try {
      await api.patch(`/api/tasks/${id}/`, { status });
      fetchTask();
      toast(`Status updated to ${getStatusLabel(status)}`, 'success');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast('Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <button onClick={() => router.push('/tasks')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium border ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)} {task.priority}
            </span>
            {task.is_overdue && (
              <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                <AlertCircle className="w-3 h-3" /> OVERDUE
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button onClick={() => setEditing(!editing)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="This task and all its comments will be permanently deleted."
        confirmLabel="Delete"
      />

      <div className="grid lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Edit Form */}
          {editing && (
            <div className="glass-card p-4 sm:p-6 animate-scale-in">
              <h3 className="text-sm sm:text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Task</h3>
              <form onSubmit={handleUpdate} className="space-y-3 sm:space-y-4">
                <input className="input-field" value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                <textarea className="input-field" rows={3} value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select className="input-field text-sm" value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TaskStatus })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                  </select>
                  <select className="input-field text-sm" value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as TaskPriority })}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="datetime-local" className="input-field text-sm" value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEditing(false)}
                    className="flex-1 py-2 rounded-xl text-sm"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
                  <button type="submit" className="flex-1 gradient-btn text-sm py-2">Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {/* Description */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Description</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Quick Status */}
          <div className="glass-card p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Quick Status Update</h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button key={status}
                  onClick={() => handleQuickStatus(status)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-medium border transition-all ${getStatusColor(status)}`}
                  style={{
                    boxShadow: task.status === status
                      ? '0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent)'
                      : 'none',
                  }}>
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <MessageSquare className="w-4 h-4" /> Comments ({task.comments?.length || 0})
            </h3>

            {/* Comment List */}
            <div className="space-y-4 mb-5">
              {(task.comments || []).map((comment: Comment) => (
                <div key={comment.id} className="flex gap-2 sm:gap-3">
                  <UserAvatar name={comment.author.full_name} avatar={comment.author.avatar} size="sm" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {comment.author.full_name}
                      </span>
                      <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm rounded-xl p-2.5 sm:p-3"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
              {(!task.comments || task.comments.length === 0) && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  No comments yet. Be the first!
                </p>
              )}
            </div>

            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                className="input-field flex-1 text-sm"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={sendingComment || !newComment.trim()}
                className="gradient-btn px-3 sm:px-4 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Details */}
        <div className="space-y-4 sm:space-y-5">
          {/* Task Info */}
          <div className="glass-card p-4 sm:p-5 space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Details</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <UserIcon className="w-3.5 h-3.5" /> Assignee
                </span>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar name={task.assignee.full_name} avatar={task.assignee.avatar} size="xs" />
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                      {task.assignee.full_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Layers className="w-3.5 h-3.5" /> Team
                </span>
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{task.team_name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <UserIcon className="w-3.5 h-3.5" /> Creator
                </span>
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{task.creator.full_name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Calendar className="w-3.5 h-3.5" /> Deadline
                </span>
                <span className="text-xs" style={{ color: task.is_overdue ? '#ef4444' : 'var(--text-primary)' }}>
                  {formatDate(task.deadline)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3.5 h-3.5" /> Created
                </span>
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{formatDateTime(task.created_at)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3.5 h-3.5" /> Updated
                </span>
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{timeAgo(task.updated_at)}</span>
              </div>
            </div>

            {/* Tags */}
            {task.tag_list && task.tag_list.length > 0 && (
              <div>
                <span className="text-xs flex items-center gap-1.5 mb-2" style={{ color: 'var(--text-muted)' }}>
                  <Tag className="w-3.5 h-3.5" /> Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {task.tag_list.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-xs"
                      style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="glass-card p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Activity</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activity.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-medium">{log.user?.full_name}</span>{' '}
                      {log.action.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(log.timestamp)}</p>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
