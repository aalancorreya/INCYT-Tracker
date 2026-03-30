import { useState } from 'react';
import type { Project, Task } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { PriorityBadge } from '../shared/PriorityBadge';
import { TaskCard } from '../shared/TaskCard';
import { AddTaskForm } from '../shared/AddTaskForm';

interface WorkstreamBlockProps {
  project: Project;
  tasks: Task[];
  weekId: string;
  defaultExpanded?: boolean;
  onTaskClick?: (taskId: string) => void;
}

export function WorkstreamBlock({
  project,
  tasks,
  weekId,
  defaultExpanded = true,
  onTaskClick,
}: WorkstreamBlockProps) {
  const { dispatch } = useTracker();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, updates } });
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  return (
    <div className="workstream">
      <div className="workstream-header" onClick={() => setExpanded(!expanded)}>
        <span
          className="workstream-header__dot"
          style={{ backgroundColor: project.color }}
        />
        <span className="workstream-header__name">{project.name}</span>
        <span className="workstream-header__priority">
          <PriorityBadge priority={project.priority} />
        </span>
        <span className="workstream-header__count">{tasks.length}</span>
        <span
          className={`workstream-header__chevron ${
            expanded ? 'workstream-header__chevron--open' : ''
          }`}
        >
          &#9654;
        </span>
      </div>

      {expanded && (
        <div className="workstream-body">
          {tasks.length === 0 && (
            <div className="empty-state">
              <span className="empty-state__text">No tasks this week</span>
            </div>
          )}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={(updates) => handleUpdateTask(task.id, updates)}
              onDelete={() => handleDeleteTask(task.id)}
              onClick={onTaskClick ? () => onTaskClick(task.id) : undefined}
            />
          ))}
          <AddTaskForm weekId={weekId} projectId={project.id} />
        </div>
      )}
    </div>
  );
}
