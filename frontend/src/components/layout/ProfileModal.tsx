'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/ui/Modal';
import UserAvatar from '@/components/ui/UserAvatar';
import { useToast } from '@/components/ui/Toast';
import { Camera, Save } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Reset form when modal opens
  const handleOpen = () => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        bio: user.bio || '',
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  if (isOpen && user && form.first_name === '' && user.first_name !== '') {
    handleOpen();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('first_name', form.first_name);
        formData.append('last_name', form.last_name);
        formData.append('phone', form.phone);
        formData.append('bio', form.bio);
        formData.append('avatar', avatarFile);
        await updateProfile(formData);
      } else {
        await updateProfile(form);
      }
      toast('Profile updated successfully!', 'success');
      onClose();
    } catch {
      toast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <UserAvatar name={user.full_name} avatar={avatarPreview || user.avatar} size="lg" />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
              style={{
                background: 'var(--accent)',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              First Name
            </label>
            <input
              className="input-field"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Last Name
            </label>
            <input
              className="input-field"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Email
          </label>
          <input
            className="input-field"
            value={user.email}
            disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
        </div>

        {/* Phone */}
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Phone
          </label>
          <input
            className="input-field"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Bio */}
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Bio
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Tell us about yourself..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 gradient-btn text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
