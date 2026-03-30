import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { PRIORITY_CONFIG } from '../../data/constants';

interface KanbanCardProps {
  task: Task;
  onTaskClick?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onTaskClick }) => {
  const { state } = useTracker();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const assignee = task.assigneeId
    ? state.people.find((p) => p.id === task.assigneeId)
    : undefined;
  const project = state.projects.find((p) => p.id === task.projectId);
  const priorityCfg = PRIORITY_CONFIG[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card${isDragging ? ' dragging' : ''}`}
    >
      <div className="task-card__header">
        {task.jiraKey && (
          <span className="task-card__jira-key mono">{task.jiraKey}</span>
        )}
        <span
          className="task-card__priority"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: priorityCfg.color,
            display: 'inline-block',
          }}
          title={priorityCfg.label}
        />
      </div>
      <div className="task-card__title" style={{ fontSize: 12, marginBottom: 6 }}>
        {task.title}
      </div>
      <div className="task-card__footer">
        {onTaskClick && (
          <button
            className="btn btn--ghost btn--sm"
            style={{ padding: '0 4px', fontSize: 11, lineHeight: 1 }}
            onClick={(e) => { e.stopPropagation(); onTaskClick(); }}
            title="Open task details"
          >
            &#x2197;
          </button>
        )}
        {project && (
          <span
            style={{
              fontSize: 10,
              color: project.color,
              background: 'var(--surface2)',
              padding: '1px 6px',
              borderRadius: 3,
            }}
          >
            {project.shortName}
          </span>
        )}
        {assignee && (
          <span
            className="avatar avatar--sm task-card__assignee"
            style={{ background: assignee.color }}
            title={assignee.name}
          >
            {assignee.initials}
          </span>
        )}
      </div>
    </div>
  );
};
