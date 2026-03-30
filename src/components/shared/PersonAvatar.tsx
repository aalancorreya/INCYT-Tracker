import type { Person } from '../../types';

interface PersonAvatarProps {
  person?: Person;
  initials?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PersonAvatar({ person, initials, color, size = 'md' }: PersonAvatarProps) {
  const displayInitials = person?.initials ?? initials ?? '?';
  const bgColor = person?.color ?? color ?? '#6c8aff';
  const sizeClass = size === 'sm' ? 'avatar--sm' : size === 'lg' ? 'avatar--lg' : '';

  return (
    <span
      className={`avatar ${sizeClass}`}
      style={{ backgroundColor: bgColor }}
      title={person?.name}
    >
      {displayInitials}
    </span>
  );
}
