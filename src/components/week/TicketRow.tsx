import type { Task } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { StatusPill } from '../shared/StatusPill';
import { PersonAvatar } from '../shared/PersonAvatar';

interface TicketRowProps {
  task: Task;
}

export function TicketRow({ task }: TicketRowProps) {
  const { state } = useTracker();
  const assignee = state.people.find((p) => p.id === task.assigneeId);
  const blocker = task.blockedBy
    ? state.tasks.find((t) => t.id === task.blockedBy)
    : undefined;

  return (
    <div className="flex gap-sm" style={{ padding: '6px 0' }}>
      {task.jiraKey && (
        <span className="task-card__jira-key mono text-xs">{task.jiraKey}</span>
      )}
      <span className="text-sm truncate" style={{ flex: 1 }}>
        {task.title}
      </span>
      <StatusPill status={task.status} />
      {assignee && <PersonAvatar person={assignee} size="sm" />}
      {blocker && (
        <span className="status-pill status-pill--blocked text-xs">
          Blocked: {blocker.jiraKey || blocker.title}
        </span>
      )}
    </div>
  );
}
