'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import type { Task, Team, User, TaskStatus, TaskPriority } from '@/types';
import {
  Plus, LayoutGrid, List, Search,
  Calendar, Tag, AlertCircle, GripVertical,
} from 'lucide-react';
import {
  getStatusColor, getStatusLabel, getPriorityColor,
  getPriorityIcon, formatDate, getInitials,
} from '@/lib/utils';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import UserAvatar from '@/components/ui/UserAvatar';
import { useToast } from '@/components/ui/Toast';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const STATUS_COLUMN_COLORS: Record<string, string> = {
  TODO: '#64748b',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#f59e0b',
  DONE: '#10b981',
};

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showCreate, setShowCreate] = useState(false);
  const [filterTeam, setFilterTeam] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Drag state
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    team: '',
    assignee_id: '',
    priority: 'MEDIUM' as TaskPriority,
    status: 'TODO' as TaskStatus,
    deadline: '',
    tags: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, teamsRes, usersRes] = await Promise.all([
        api.get('/api/tasks/'),
        api.get('/api/teams/'),
        api.get('/api/auth/users/'),
      ]);
      setTasks(tasksRes.data.results || tasksRes.data);
      setTeams(teamsRes.data.results || teamsRes.data);
      setUsers(usersRes.data.results || usersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...newTask,
        assignee_id: newTask.assignee_id || null,
        deadline: newTask.deadline || null,
      };
      await api.post('/api/tasks/', payload);
      setNewTask({
        title: '', description: '', team: '', assignee_id: '',
        priority: 'MEDIUM', status: 'TODO', deadline: '', tags: '',
      });
      setShowCreate(false);
      fetchData();
      toast('Task created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast('Failed to create task', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/`, { status: newStatus });
      setTasks((prev) => prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
      toast(`Task moved to ${getStatusLabel(newStatus)}`, 'success');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast('Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/api/tasks/${taskId}/`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast('Task deleted', 'success');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast('Failed to delete task', 'error');
    }
  };

  // ─── Drag and Drop ───
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Set a transparent drag image for custom feel
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedTask(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedTask) {
      const task = tasks.find((t) => t.id === draggedTask);
      if (task && task.status !== newStatus) {
        handleStatusChange(draggedTask, newStatus);
      }
    }
    setDraggedTask(null);
  };

  // ─── Mobile status change via select ───
  const handleMobileStatusChange = (taskId: string, newStatus: TaskStatus) => {
    handleStatusChange(taskId, newStatus);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesTeam = !filterTeam || t.team === filterTeam;
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const getTasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {filteredTasks.length} tasks total
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {[
              { v: 'kanban' as const, icon: LayoutGrid },
              { v: 'list' as const, icon: List },
            ].map(({ v, icon: Icon }) => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-2 transition-all"
                style={{
                  background: view === v ? 'var(--accent)' : 'var(--bg-card)',
                  color: view === v ? 'white' : 'var(--text-secondary)',
                }}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)} className="gradient-btn flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5">
            <Plus className="w-4 h-4" /> <span className="hidden xs:inline">New Task</span><span className="xs:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search tasks..." className="input-field pl-10 text-sm"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="input-field text-sm w-full sm:w-auto"
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Title *</label>
            <input className="input-field" placeholder="Task title"
              value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea className="input-field" rows={3} placeholder="Describe the task..."
              value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Team *</label>
              <select className="input-field" value={newTask.team}
                onChange={(e) => setNewTask({ ...newTask, team: e.target.value })} required>
                <option value="">Select team</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Assignee</label>
              <select className="input-field" value={newTask.assignee_id}
                onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select className="input-field" value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Deadline</label>
              <input type="datetime-local" className="input-field" value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tags</label>
            <input className="input-field" placeholder="frontend, bug, urgent (comma-separated)"
              value={newTask.tags} onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={creating} className="flex-1 gradient-btn text-sm py-2.5">
              {creating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteTask(deleteTarget)}
        title="Delete Task"
        message="This action cannot be undone. The task and its comments will be permanently deleted."
        confirmLabel="Delete"
      />

      {/* Kanban View */}
      {view === 'kanban' && (
        <>
          {/* Desktop Kanban: 4 columns side by side */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 min-h-[60vh]">
            {STATUSES.map((status) => {
              const columnTasks = getTasksByStatus(status);
              const isOver = dragOverCol === status;
              return (
                <div
                  key={status}
                  className="flex flex-col"
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-2.5 h-2.5 rounded-full"
                      style={{ background: STATUS_COLUMN_COLORS[status] }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {getStatusLabel(status)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Column Body */}
                  <div
                    className="flex-1 space-y-3 p-2 rounded-xl min-h-48 transition-all duration-200"
                    style={{
                      background: isOver ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                      border: isOver ? '2px dashed var(--accent)' : '2px dashed transparent',
                    }}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onDelete={(id) => setDeleteTarget(id)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        draggable
                      />
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs rounded-lg border border-dashed"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        {isOver ? 'Drop here' : 'No tasks'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Kanban: stacked columns */}
          <div className="md:hidden space-y-4">
            {STATUSES.map((status) => {
              const columnTasks = getTasksByStatus(status);
              if (columnTasks.length === 0 && dragOverCol !== status) return null;
              return (
                <div key={status}>
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-2.5 h-2.5 rounded-full"
                      style={{ background: STATUS_COLUMN_COLORS[status] }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {getStatusLabel(status)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleMobileStatusChange}
                        onDelete={(id) => setDeleteTarget(id)}
                        showStatusSelect
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredTasks.length === 0 && (
              <div className="glass-card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                No tasks found
              </div>
            )}
          </div>
        </>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="glass-card overflow-hidden">
          {/* Table Header - hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 lg:px-6 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Deadline</div>
          </div>
          {/* Rows */}
          {filteredTasks.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No tasks found
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredTasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}
                  className="block sm:grid sm:grid-cols-12 gap-4 px-4 lg:px-6 py-4 transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  {/* Mobile: Card layout */}
                  <div className="sm:col-span-4">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {task.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {task.team_name}
                    </p>
                  </div>
                  {/* Mobile: inline badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 sm:contents">
                    <div className="sm:col-span-2 flex items-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                    <div className="sm:col-span-2 flex items-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityIcon(task.priority)} {task.priority}
                      </span>
                    </div>
                    <div className="sm:col-span-2 flex items-center">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar name={task.assignee.full_name} avatar={task.assignee.avatar} size="xs" />
                          <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
                            {task.assignee.first_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                      )}
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1">
                      {task.is_overdue && <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />}
                      <span className="text-xs" style={{ color: task.is_overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {formatDate(task.deadline)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Task Card Component (Kanban) ─── */
function TaskCard({
  task,
  onStatusChange,
  onDelete,
  onDragStart,
  onDragEnd,
  draggable = false,
  showStatusSelect = false,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  draggable?: boolean;
  showStatusSelect?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`glass-card glass-card-hover p-3 sm:p-4 relative group ${draggable ? 'task-card-drag' : ''}`}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragEnd={onDragEnd}
    >
      {/* Drag handle (desktop only) */}
      {draggable && (
        <div className="absolute top-3 left-1 opacity-0 group-hover:opacity-60 transition-opacity hidden sm:block"
          style={{ color: 'var(--text-muted)' }}>
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      )}

      <Link href={`/tasks/${task.id}`}>
        {/* Priority & Tags */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-semibold ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)} {task.priority}
          </span>
          {task.is_overdue && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-semibold"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
              OVERDUE
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium mb-2 leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {task.title}
        </h4>

        {/* Tags */}
        {task.tag_list && task.tag_list.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tag_list.slice(0, 3).map((tag, i) => (
              <span key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                <Tag className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <UserAvatar name={task.assignee.full_name} avatar={task.assignee.avatar} size="xs" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                <span className="text-[10px]">?</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {task.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(task.deadline)}
              </span>
            )}
            {task.comment_count > 0 && (
              <span>{task.comment_count} 💬</span>
            )}
          </div>
        </div>
      </Link>

      {/* Mobile: Status select */}
      {showStatusSelect && (
        <div className="mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <select
            className="input-field text-xs py-1.5"
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, e.target.value as TaskStatus);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{getStatusLabel(s)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Desktop: Quick status menu */}
      <button
        className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hidden sm:flex"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}>
        ⋮
      </button>

      {showMenu && (
        <div className="absolute top-10 right-3 z-20 glass-card py-1 w-36 animate-scale-in" onClick={(e) => e.stopPropagation()}>
          {STATUSES.filter((s) => s !== task.status).map((status) => (
            <button key={status}
              className="w-full px-3 py-2 text-xs text-left flex items-center gap-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onClick={() => { onStatusChange(task.id, status); setShowMenu(false); }}>
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLUMN_COLORS[status] }} />
              {getStatusLabel(status)}
            </button>
          ))}
          <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
          <button
            className="w-full px-3 py-2 text-xs text-left transition-colors"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => { onDelete(task.id); setShowMenu(false); }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
