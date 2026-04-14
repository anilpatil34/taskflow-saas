'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import type { TeamDetail, TeamMembership } from '@/types';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Users, UserPlus, Crown, Shield, User,
  Trash2, CheckSquare, Calendar,
} from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import UserAvatar from '@/components/ui/UserAvatar';
import { useToast } from '@/components/ui/Toast';

const ROLE_CONFIG: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  OWNER: { icon: Crown, color: '#f59e0b', label: 'Owner' },
  ADMIN: { icon: Shield, color: '#6366f1', label: 'Admin' },
  MEMBER: { icon: User, color: '#64748b', label: 'Member' },
};

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    try {
      const res = await api.get(`/api/teams/${id}/`);
      setTeam(res.data.results ? res.data.results : res.data);
    } catch {
      router.push('/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteMsg('');
    try {
      const res = await api.post(`/api/teams/${id}/invite/`, { email: inviteEmail });
      setInviteMsg(res.data.message);
      setInviteEmail('');
      fetchTeam();
      toast('Invitation sent!', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Failed to invite.';
      setInviteMsg(msg);
      toast(msg, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/api/teams/${id}/members/${userId}/`);
      fetchTeam();
      toast('Member removed', 'success');
    } catch {
      toast('Failed to remove member', 'error');
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

  if (!team) return null;

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <button onClick={() => router.push('/teams')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{team.name}</h1>
          <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-muted)' }}>{team.description || 'No description'}</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="gradient-btn flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-5 flex-shrink-0">
          <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Invite</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: Users, label: 'Members', value: team.members?.length || 0, color: '#6366f1' },
          { icon: CheckSquare, label: 'Tasks', value: team.task_count || 0, color: '#10b981' },
          { icon: Calendar, label: 'Created', value: formatDate(team.created_at), color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-3 sm:p-5">
            <s.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2" style={{ color: s.color }} />
            <p className="text-base sm:text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInvite} onClose={() => { setShowInvite(false); setInviteMsg(''); }} title="Invite Member" maxWidth="max-w-md">
        <form onSubmit={handleInvite} className="space-y-4">
          <input className="input-field" type="email" placeholder="member@example.com"
            value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
          {inviteMsg && (
            <p className="text-sm" style={{ color: 'var(--accent)' }}>{inviteMsg}</p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => { setShowInvite(false); setInviteMsg(''); }}
              className="flex-1 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={inviting} className="flex-1 gradient-btn text-sm py-2.5">
              {inviting ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeTarget && handleRemoveMember(removeTarget)}
        title="Remove Member"
        message="This member will be removed from the team immediately."
        confirmLabel="Remove"
      />

      {/* Members */}
      <div className="glass-card">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Team Members ({team.members?.length || 0})
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {(team.members || []).map((m: TeamMembership) => {
            const roleConfig = ROLE_CONFIG[m.role] || ROLE_CONFIG.MEMBER;
            const RoleIcon = roleConfig.icon;
            return (
              <div key={m.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <UserAvatar name={m.user.full_name} avatar={m.user.avatar} size="sm" className="sm:w-10 sm:h-10" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {m.user.full_name}
                  </p>
                  <p className="text-[10px] sm:text-xs truncate" style={{ color: 'var(--text-muted)' }}>{m.user.email}</p>
                </div>
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium flex-shrink-0"
                  style={{ background: `${roleConfig.color}15`, color: roleConfig.color }}>
                  <RoleIcon className="w-3 h-3" /> <span className="hidden xs:inline">{roleConfig.label}</span>
                </span>
                {m.role !== 'OWNER' && (
                  <button onClick={() => setRemoveTarget(m.user.id)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
