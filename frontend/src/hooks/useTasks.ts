'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { Task, TaskStatus, TaskPriority } from '@/types';

interface UseTasksOptions {
  teamId?: string;
  autoFetch?: boolean;
}

interface CreateTaskData {
  title: string;
  description?: string;
  team: string;
  assignee_id?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string | null;
  tags?: string;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { teamId, autoFetch = true } = options;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = teamId ? `?team=${teamId}` : '';
      const res = await api.get(`/api/tasks/${params}`);
      setTasks(res.data.results || res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (autoFetch) fetchTasks();
  }, [autoFetch, fetchTasks]);

  const createTask = async (data: CreateTaskData) => {
    const payload = {
      ...data,
      assignee_id: data.assignee_id || null,
      deadline: data.deadline || null,
    };
    await api.post('/api/tasks/', payload);
    await fetchTasks();
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    await api.patch(`/api/tasks/${taskId}/`, data);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...data } : t))
    );
  };

  const deleteTask = async (taskId: string) => {
    await api.delete(`/api/tasks/${taskId}/`);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    await api.patch(`/api/tasks/${taskId}/`, { status });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
  };
}
