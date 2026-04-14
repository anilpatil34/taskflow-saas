'use client';

import { getInitials } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  xs: { container: 'w-6 h-6', text: 'text-[8px]' },
  sm: { container: 'w-8 h-8', text: 'text-[10px]' },
  md: { container: 'w-10 h-10', text: 'text-xs' },
  lg: { container: 'w-14 h-14', text: 'text-base' },
};

export default function UserAvatar({
  name,
  avatar,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const s = SIZES[size];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${s.container} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${s.container} rounded-full flex items-center justify-center ${s.text} font-bold text-white flex-shrink-0 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
      }}
    >
      {getInitials(name)}
    </div>
  );
}
