'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Team } from '@/types';
import Link from 'next/link';
import { Plus, Users, ChevronRight, Layers, Search } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function TeamsPage() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/api/teams/');
      setTeams(res.data.results || res.data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      toast('Failed to load teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/teams/', newTeam);
      setNewTeam({ name: '', description: '' });
      setShowCreate(false);
      fetchTeams();
      toast('Team created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create team:', error);
      toast('Failed to create team', 'error');
    } finally {
      setCreating(false);
    }
  };

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Teams</h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage your teams and collaborate
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="gradient-btn flex items-center gap-2 text-xs sm:text-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search teams..."
          className="input-field pl-10 w-full sm:max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Team" maxWidth="max-w-md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Team Name</label>
            <input className="input-field" placeholder="e.g., Engineering"
              value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea className="input-field" rows={3} placeholder="What does this team do?"
              value={newTeam.description} onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={creating}
              className="flex-1 gradient-btn text-sm py-2.5 disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Teams Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-8 sm:p-12 text-center">
          <Layers className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-base sm:text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No teams yet</p>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create your first team to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 stagger-children">
          {filtered.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}
              className="glass-card glass-card-hover p-5 sm:p-6 block group">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
                  {getInitials(team.name)}
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {team.name}
              </h3>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {team.description || 'No description'}
              </p>
              <div className="flex items-center gap-3 sm:gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {team.member_count} members
                </span>
                <span>{formatDate(team.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
