import React from 'react';
import { useTracker } from '../../store/TrackerContext';
import type { Project, Task } from '../../types';
import { PRIORITY_CONFIG } from '../../data/constants';

interface ProjectHealthCardProps {
  project: Project;
  onSelect?: (projectId: string) => void;
}

export const ProjectHealthCard: React.FC<ProjectHealthCardProps> = ({ project, onSelect }) => {
  const { state } = useTracker();

  const projectTasks = state.tasks.filter((t) => t.projectId === project.id);
  const totalTasks = projectTasks.length;
  const doneTasks = projectTasks.filter((t) => t.status === 'done' || t.status === 'released').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in-progress').length;
  const blockedTasks = projectTasks.filter((t) => t.status === 'blocked').length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const owners = state.people.filter((p) => project.owners.includes(p.id));
  const priorityCfg = PRIORITY_CONFIG[project.priority];

  return (
    <div
      className="health-card"
      onClick={() => onSelect?.(project.id)}
      style={{ cursor: onSelect ? 'pointer' : undefined }}
    >
      <div className="health-card__header">
        <span className="health-card__dot" style={{ background: project.color }} />
        <span className="health-card__name">{project.name}</span>
        <span
          className={`priority-badge priority-badge--${project.priority}`}
          style={{ background: priorityCfg.bg, color: priorityCfg.color }}
        >
          {priorityCfg.label}
        </span>
      </div>

      <div className="health-card__progress">
        <div className="health-card__progress-bar">
          <div
            className="health-card__progress-fill"
            style={{
              width: `${progressPct}%`,
              background: progressPct === 100 ? 'var(--green)' : 'var(--accent)',
            }}
          />
        </div>
        <div className="health-card__progress-label">
          <span>{doneTasks} / {totalTasks} tasks</span>
          <span>{progressPct}%</span>
        </div>
      </div>

      <div className="health-card__stats">
        <div className="health-card__stat">
          <span className="health-card__stat-value">{totalTasks}</span>
          <span className="health-card__stat-label">Total</span>
        </div>
        <div className="health-card__stat">
          <span className="health-card__stat-value" style={{ color: 'var(--accent)' }}>
            {inProgressTasks}
          </span>
          <span className="health-card__stat-label">In Progress</span>
        </div>
        <div className="health-card__stat">
          <span className="health-card__stat-value" style={{ color: 'var(--red)' }}>
            {blockedTasks}
          </span>
          <span className="health-card__stat-label">Blocked</span>
        </div>
        <div className="health-card__stat">
          <span className="health-card__stat-value" style={{ color: 'var(--green)' }}>
            {doneTasks}
          </span>
          <span className="health-card__stat-label">Done</span>
        </div>
      </div>

      {owners.length > 0 && (
        <div className="flex gap-xs" style={{ marginTop: 12 }}>
          {owners.map((p) => (
            <span
              key={p.id}
              className="avatar avatar--sm"
              style={{ background: p.color }}
              title={p.name}
            >
              {p.initials}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
