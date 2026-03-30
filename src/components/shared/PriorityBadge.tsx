import type { Priority } from '../../types';
import { PRIORITY_CONFIG } from '../../data/constants';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`priority-badge priority-badge--${priority}`}>
      {config.icon} {config.label}
    </span>
  );
}
