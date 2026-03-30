import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus, Priority } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, WEEKS } from '../../data/constants';
import { Modal } from './Modal';
import { PersonAvatar } from './PersonAvatar';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { state, dispatch } = useTracker();
  const task = taskId ? state.tasks.find((t) => t.id === taskId) : null;

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'normal' as Priority,
    assigneeId: '',
    weekId: '',
    projectId: '',
    jiraKey: '',
    blockerNote: '',
    tags: '',
    estimatedHours: '',
    isDeviceTask: false,
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId || '',
        weekId: task.weekId,
        projectId: task.projectId,
        jiraKey: task.jiraKey || '',
        blockerNote: task.blockerNote || '',
        tags: (task.tags || []).join(', '),
        estimatedHours: task.estimatedHours?.toString() || '',
        isDeviceTask: task.isDeviceTask,
      });
      setConfirmDelete(false);
    }
  }, [task]);

  if (!task) return null;

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updates: Partial<Task> = {};

    if (form.title.trim() !== task.title) updates.title = form.title.trim();
    if (form.description !== (task.description || '')) updates.description = form.description || undefined;
    if (form.status !== task.status) updates.status = form.status;
    if (form.priority !== task.priority) updates.priority = form.priority;
    if (form.assigneeId !== (task.assigneeId || '')) updates.assigneeId = form.assigneeId || undefined;
    if (form.weekId !== task.weekId) updates.weekId = form.weekId;
    if (form.projectId !== task.projectId) updates.projectId = form.projectId;
    if (form.jiraKey !== (task.jiraKey || '')) updates.jiraKey = form.jiraKey || undefined;
    if (form.blockerNote !== (task.blockerNote || '')) updates.blockerNote = form.blockerNote || undefined;
    if (form.isDeviceTask !== task.isDeviceTask) updates.isDeviceTask = form.isDeviceTask;

    const newTags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const oldTags = task.tags || [];
    if (JSON.stringify(newTags) !== JSON.stringify(oldTags)) updates.tags = newTags;

    const hours = form.estimatedHours ? parseFloat(form.estimatedHours) : undefined;
    if (hours !== task.estimatedHours) updates.estimatedHours = hours;

    if (Object.keys(updates).length > 0) {
      dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates } });
    }
    onClose();
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
    onClose();
  };

  const project = state.projects.find((p) => p.id === form.projectId);
  const assignee = state.people.find((p) => p.id === form.assigneeId);

  const footer = (
    <div className="task-detail-form__actions">
      <div>
        {!confirmDelete ? (
          <button
            className="btn btn--sm task-detail-form__delete"
            onClick={() => setConfirmDelete(true)}
          >
            Delete Task
          </button>
        ) : (
          <div className="flex gap-sm">
            <button className="btn btn--sm task-detail-form__delete" onClick={handleDelete}>
              Confirm Delete
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-sm">
        <button className="btn btn--ghost btn--sm" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn--accent btn--sm" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={!!taskId}
      onClose={onClose}
      title={task.jiraKey ? `${task.jiraKey} — Edit Task` : 'Edit Task'}
      size="lg"
      footer={footer}
    >
      <div className="task-detail-form">
        {/* Context bar */}
        {project && (
          <div className="flex gap-sm" style={{ alignItems: 'center', marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
            <span className="text-sm" style={{ color: project.color }}>{project.name}</span>
            {assignee && (
              <>
                <span className="text-muted">·</span>
                <PersonAvatar person={assignee} size="sm" />
                <span className="text-sm text-dim">{assignee.name}</span>
              </>
            )}
          </div>
        )}

        {/* Title */}
        <div className="task-detail-form__field">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="task-detail-form__field">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Add a description..."
            rows={3}
          />
        </div>

        {/* Row: Status + Priority */}
        <div className="task-detail-form__row">
          <div className="task-detail-form__field">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div className="task-detail-form__field">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: Assignee + Week */}
        <div className="task-detail-form__row">
          <div className="task-detail-form__field">
            <label className="form-label">Assignee</label>
            <select
              className="form-select"
              value={form.assigneeId}
              onChange={(e) => handleChange('assigneeId', e.target.value)}
            >
              <option value="">Unassigned</option>
              {state.people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="task-detail-form__field">
            <label className="form-label">Week</label>
            <select
              className="form-select"
              value={form.weekId}
              onChange={(e) => handleChange('weekId', e.target.value)}
            >
              {WEEKS.map((w) => (
                <option key={w.id} value={w.id}>W{w.number}: {w.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: Project + Jira Key */}
        <div className="task-detail-form__row">
          <div className="task-detail-form__field">
            <label className="form-label">Project</label>
            <select
              className="form-select"
              value={form.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
            >
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="task-detail-form__field">
            <label className="form-label">Jira Key</label>
            <input
              className="form-input"
              value={form.jiraKey}
              onChange={(e) => handleChange('jiraKey', e.target.value)}
              placeholder="e.g. IN-2089"
            />
          </div>
        </div>

        {/* Blocker Note */}
        <div className="task-detail-form__field">
          <label className="form-label">Blocker Note</label>
          <input
            className="form-input"
            value={form.blockerNote}
            onChange={(e) => handleChange('blockerNote', e.target.value)}
            placeholder="What's blocking this task?"
          />
        </div>

        {/* Row: Tags + Est. Hours */}
        <div className="task-detail-form__row">
          <div className="task-detail-form__field">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              className="form-input"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="e.g. backend, urgent"
            />
          </div>
          <div className="task-detail-form__field">
            <label className="form-label">Estimated Hours</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.5"
              value={form.estimatedHours}
              onChange={(e) => handleChange('estimatedHours', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Device task checkbox */}
        <label className="flex gap-sm" style={{ alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.isDeviceTask}
            onChange={(e) => handleChange('isDeviceTask', e.target.checked)}
          />
          <span className="text-sm">Device-only task (no Jira trail)</span>
        </label>
      </div>
    </Modal>
  );
}
