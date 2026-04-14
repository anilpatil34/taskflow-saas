'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { Team, TeamDetail } from '@/types';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/teams/');
      setTeams(res.data.results || res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = async (data: { name: string; description: string }) => {
    await api.post('/api/teams/', data);
    await fetchTeams();
  };

  return { teams, loading, error, fetchTeams, createTeam };
}

export function useTeamDetail(id: string) {
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/teams/${id}/`);
      setTeam(res.data.results ? res.data.results : res.data);
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const inviteMember = async (email: string) => {
    const res = await api.post(`/api/teams/${id}/invite/`, { email });
    await fetchTeam();
    return res.data.message;
  };

  const removeMember = async (userId: string) => {
    await api.delete(`/api/teams/${id}/members/${userId}/`);
    await fetchTeam();
  };

  return { team, loading, fetchTeam, inviteMember, removeMember };
}
