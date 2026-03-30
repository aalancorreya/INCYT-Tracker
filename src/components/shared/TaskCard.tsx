import type { Task, TaskStatus } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { STATUS_CONFIG } from '../../data/constants';
import { StatusPill } from './StatusPill';
import { PriorityBadge } from './PriorityBadge';
import { PersonAvatar } from './PersonAvatar';
import { InlineEdit } from './InlineEdit';

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  compact?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, onUpdate, onDelete, compact, onClick }: TaskCardProps) {
  const { state } = useTracker();
  const assignee = state.people.find((p) => p.id === task.assigneeId);
  const blocker = task.blockedBy
    ? state.tasks.find((t) => t.id === task.blockedBy)
    : undefined;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ status: e.target.value as TaskStatus });
  };

  return (
    <div className="task-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <div className="task-card__header">
        {task.jiraKey ? (
          <span className="task-card__jira-key">{task.jiraKey}</span>
        ) : task.isDeviceTask ? (
          <span className="priority-badge priority-badge--stretch">Device</span>
        ) : null}
        <span className="task-card__priority">
          <PriorityBadge priority={task.priority} />
        </span>
      </div>

      <div className="task-card__title" onClick={(e) => e.stopPropagation()}>
        <InlineEdit
          value={task.title}
          onSave={(title) => onUpdate({ title })}
          placeholder="Task title..."
        />
      </div>

      <div className="task-card__footer">
        <StatusPill status={task.status} />

        {!compact && (
          <select
            className="form-select"
            value={task.status}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'auto', padding: '2px 24px 2px 6px', fontSize: '11px' }}
          >
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        )}

        {assignee && (
          <span className="task-card__assignee">
            <PersonAvatar person={assignee} size="sm" />
          </span>
        )}
      </div>

      {task.blockedBy && blocker && (
        <div className="task-card__tags">
          <span className="status-pill status-pill--blocked">
            Blocked by: {blocker.jiraKey || blocker.title}
          </span>
        </div>
      )}

      {task.blockerNote && !task.blockedBy && (
        <div className="task-card__tags">
          <span className="status-pill status-pill--blocked">
            {task.blockerNote}
          </span>
        </div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="task-card__tags">
          {task.tags.map((tag) => (
            <span key={tag} className="task-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
