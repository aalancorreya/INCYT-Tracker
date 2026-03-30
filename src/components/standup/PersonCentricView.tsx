import React from 'react';
import { useTracker } from '../../store/TrackerContext';
import type { Task } from '../../types';
import { STATUS_CONFIG } from '../../data/constants';

interface PersonCentricViewProps {
  weekId: string;
  checkedIds: Set<string>;
  onToggle: (taskId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export const PersonCentricView: React.FC<PersonCentricViewProps> = ({
  weekId,
  checkedIds,
  onToggle,
  onTaskClick,
}) => {
  const { state } = useTracker();

  const weekTasks = state.tasks.filter((t) => t.weekId === weekId);

  // Group by person
  const grouped: { personId: string; tasks: Task[] }[] = [];
  const personMap = new Map<string, Task[]>();

  for (const task of weekTasks) {
    const pid = task.assigneeId || '__unassigned';
    if (!personMap.has(pid)) personMap.set(pid, []);
    personMap.get(pid)!.push(task);
  }

  for (const person of state.people) {
    const tasks = personMap.get(person.id);
    if (tasks && tasks.length > 0) {
      grouped.push({ personId: person.id, tasks });
    }
  }

  // Unassigned at the end
  const unassigned = personMap.get('__unassigned');
  if (unassigned && unassigned.length > 0) {
    grouped.push({ personId: '__unassigned', tasks: unassigned });
  }

  // People with no tasks
  const peopleWithNoTasks = state.people.filter(
    (p) => !personMap.has(p.id) || personMap.get(p.id)!.length === 0
  );

  return (
    <div>
      {grouped.map(({ personId, tasks }) => {
        const person = state.people.find((p) => p.id === personId);
        return (
          <div key={personId} className="standup-person-group">
            <div className="standup-person-group__header">
              {person ? (
                <>
                  <span
                    className="avatar avatar--sm"
                    style={{ background: person.color }}
                  >
                    {person.initials}
                  </span>
                  <span className="standup-person-group__name">{person.name}</span>
                  <span className="standup-person-group__role">{person.role}</span>
                </>
              ) : (
                <span className="standup-person-group__name">Unassigned</span>
              )}
            </div>
            {tasks.map((task) => {
              const statusCfg = STATUS_CONFIG[task.status];
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

      {peopleWithNoTasks.map((person) => (
        <div key={person.id} className="standup-person-group">
          <div className="standup-person-group__header">
            <span
              className="avatar avatar--sm"
              style={{ background: person.color }}
            >
              {person.initials}
            </span>
            <span className="standup-person-group__name">{person.name}</span>
            <span className="standup-person-group__role">{person.role}</span>
          </div>
          <div style={{ padding: '6px 0 6px 8px', fontSize: 12, color: 'var(--text-muted)' }}>
            No tasks this week
          </div>
        </div>
      ))}
    </div>
  );
};
