import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../types';
import { STATUS_CONFIG } from '../../data/constants';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onTaskClick }) => {
  const { setNodeRef } = useDroppable({ id: status });
  const cfg = STATUS_CONFIG[status];
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="kanban-column" ref={setNodeRef}>
      <div className="kanban-column-header">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: cfg.color,
            flexShrink: 0,
          }}
        />
        <span className="kanban-column-header__label">{cfg.label}</span>
        <span className="kanban-column-header__count">{tasks.length}</span>
      </div>
      <div className="kanban-column__body">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => <KanbanCard key={task.id} task={task} onTaskClick={onTaskClick ? () => onTaskClick(task.id) : undefined} />)
          ) : (
            <div className="kanban-column__empty">No tasks</div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
