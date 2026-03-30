import type { TaskStatus } from '../../types';
import { STATUS_CONFIG } from '../../data/constants';

export function StatusPill({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`status-pill status-pill--${status}`}>
      {config.label}
    </span>
  );
}
