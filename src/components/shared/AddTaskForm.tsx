import { useState } from 'react';
import type { TaskStatus, Priority } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { STATUS_CONFIG } from '../../data/constants';

interface AddTaskFormProps {
  weekId: string;
  projectId?: string;
}

export function AddTaskForm({ weekId, projectId }: AddTaskFormProps) {
  const { state, dispatch } = useTracker();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeId, setAssigneeId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProject) return;

    const project = state.projects.find((p) => p.id === selectedProject);
    const existingTasks = state.tasks.filter(
      (t) => t.weekId === weekId && t.projectId === selectedProject
    );

    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: `task-${Date.now()}`,
        projectId: selectedProject,
        title: title.trim(),
        status,
        priority: 'normal' as Priority,
        assigneeId: assigneeId || undefined,
        weekId,
        isDeviceTask: project?.isDeviceOnly ?? false,
        order: existingTasks.length,
      },
    });

    setTitle('');
    setStatus('todo');
    setAssigneeId('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button className="btn btn--ghost btn--sm" onClick={() => setIsOpen(true)}>
        + Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-col gap-sm">
      <input
        className="form-input"
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />

      {!projectId && (
        <select
          className="form-select"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Select project...</option>
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      <select
        className="form-select"
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
      >
        {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_CONFIG[s].label}
          </option>
        ))}
      </select>

      <select
        className="form-select"
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
      >
        <option value="">Unassigned</option>
        {state.people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="flex gap-sm">
        <button type="submit" className="btn btn--accent btn--sm">
          Add
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
