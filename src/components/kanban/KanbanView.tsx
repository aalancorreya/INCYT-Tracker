import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { useTracker } from '../../store/TrackerContext';
import type { Task, TaskStatus } from '../../types';
import { WEEKS, STATUS_CONFIG } from '../../data/constants';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { TaskDetailModal } from '../shared/TaskDetailModal';

const KANBAN_STATUSES: TaskStatus[] = [
  'todo',
  'in-progress',
  'code-review',
  'testing',
  'done',
  'released',
  'blocked',
];

const KanbanCardOverlay: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <div className="task-card dragging" style={{ opacity: 0.9, cursor: 'grabbing' }}>
      <div className="task-card__header">
        {task.jiraKey && (
          <span className="task-card__jira-key mono">{task.jiraKey}</span>
        )}
      </div>
      <div className="task-card__title" style={{ fontSize: 12 }}>
        {task.title}
      </div>
    </div>
  );
};

export const KanbanView: React.FC = () => {
  const { state, dispatch, getCurrentWeek } = useTracker();

  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks;
    if (weekFilter !== 'all') {
      tasks = tasks.filter((t) => t.weekId === weekFilter);
    }
    if (projectFilter !== 'all') {
      tasks = tasks.filter((t) => t.projectId === projectFilter);
    }
    if (personFilter !== 'all') {
      tasks = tasks.filter((t) => t.assigneeId === personFilter);
    }
    return tasks;
  }, [state.tasks, weekFilter, projectFilter, personFilter]);

  const columnTasks = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {} as any;
    for (const status of KANBAN_STATUSES) {
      map[status] = filteredTasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.order - b.order);
    }
    return map;
  }, [filteredTasks]);

  const activeTask = activeId
    ? state.tasks.find((t) => t.id === activeId) ?? null
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: could implement cross-column reorder preview here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column (status)
    const isColumn = KANBAN_STATUSES.includes(overId as TaskStatus);
    let newStatus: TaskStatus;

    if (isColumn) {
      newStatus = overId as TaskStatus;
    } else {
      // Dropped on another card -- find which column that card is in
      const overTask = state.tasks.find((t) => t.id === overId);
      if (!overTask) return;
      newStatus = overTask.status;
    }

    const currentTask = state.tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    if (currentTask.status !== newStatus) {
      // Cross-column move
      dispatch({
        type: 'MOVE_TASK',
        payload: { taskId, status: newStatus },
      });
    } else if (!isColumn) {
      // Same-column reorder: build new order from the column's current task list
      const colTasks = columnTasks[newStatus].map((t) => t.id);
      const oldIndex = colTasks.indexOf(taskId);
      const newIndex = colTasks.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = [...colTasks];
        reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, taskId);
        dispatch({
          type: 'REORDER_TASKS',
          payload: { taskIds: reordered, status: newStatus, weekId: currentTask.weekId },
        });
      }
    }
  };

  return (
    <div className="flex-col gap-md">
      {/* Header */}
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
        Kanban Board
      </h1>

      {/* Filter bar */}
      <div className="filter-bar">
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 120 }}
          value={weekFilter}
          onChange={(e) => setWeekFilter(e.target.value)}
        >
          <option value="all">All Weeks</option>
          {WEEKS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label} ({w.startDate})
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="all">All Projects</option>
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.shortName}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
        >
          <option value="all">All People</option>
          {state.people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {KANBAN_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columnTasks[status]}
              onTaskClick={(taskId) => setDetailTaskId(taskId)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal taskId={detailTaskId} onClose={() => setDetailTaskId(null)} />
    </div>
  );
};
