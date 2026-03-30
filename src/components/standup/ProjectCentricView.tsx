import React from 'react';
import { useTracker } from '../../store/TrackerContext';
import type { Task } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../data/constants';

interface ProjectCentricViewProps {
  weekId: string;
  checkedIds: Set<string>;
  onToggle: (taskId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export const ProjectCentricView: React.FC<ProjectCentricViewProps> = ({
  weekId,
  checkedIds,
  onToggle,
  onTaskClick,
}) => {
  const { state } = useTracker();

  const weekTasks = state.tasks.filter((t) => t.weekId === weekId);

  // Group by project
  const projectMap = new Map<string, Task[]>();
  for (const task of weekTasks) {
    if (!projectMap.has(task.projectId)) projectMap.set(task.projectId, []);
    projectMap.get(task.projectId)!.push(task);
  }

  return (
    <div>
      {state.projects.map((project) => {
        const tasks = projectMap.get(project.id);
        if (!tasks || tasks.length === 0) return null;

        const priorityCfg = PRIORITY_CONFIG[project.priority];

        return (
          <div key={project.id} className="standup-person-group">
            <div className="standup-person-group__header">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: project.color,
                  flexShrink: 0,
                }}
              />
              <span className="standup-person-group__name">{project.name}</span>
              <span
                className={`priority-badge priority-badge--${project.priority}`}
                style={{ background: priorityCfg.bg, color: priorityCfg.color }}
              >
                {priorityCfg.label}
              </span>
            </div>
            {tasks.map((task) => {
              const statusCfg = STATUS_CONFIG[task.status];
              const assignee = task.assigneeId
                ? state.people.find((p) => p.id === task.assigneeId)
                : undefined;
              const checked = checkedIds.has(task.id);

              return (
                <div key={task.id} className="standup-check">
                  <input
                    type="checkbox"
                    className="standup-check__checkbox"
                    checked={checked}
                    onChange={() => onToggle(task.id)}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      className={`standup-check__text${checked ? ' standup-check__text--done' : ''}`}
                      onClick={() => onTaskClick?.(task.id)}
                      style={{ cursor: onTaskClick ? 'pointer' : undefined }}
                    >
                      {task.jiraKey && (
                        <span className="mono text-accent" style={{ marginRight: 6, fontSize: 11 }}>
                          {task.jiraKey}
                        </span>
                      )}
                      {task.title}
                    </span>
                    <div className="standup-check__meta">
                      {assignee && (
                        <span
                          className="avatar avatar--sm"
                          style={{ background: assignee.color, width: 18, height: 18, fontSize: 8 }}
                          title={assignee.name}
                        >
                          {assignee.initials}
                        </span>
                      )}
                      <span
                        className={`status-pill status-pill--${task.status}`}
                        style={{ background: statusCfg.bg, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
