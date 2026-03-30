import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTracker } from '../../store/TrackerContext';
import { WeekTabs } from './WeekTabs';
import { WorkstreamBlock } from './WorkstreamBlock';
import { FilterBar } from '../shared/FilterBar';
import { TaskDetailModal } from '../shared/TaskDetailModal';

export function WeekView() {
  const { weekId: paramWeekId } = useParams<{ weekId?: string }>();
  const navigate = useNavigate();
  const { state, filters, getCurrentWeek } = useTracker();

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const activeWeekId = paramWeekId || getCurrentWeek();

  const handleSelectWeek = (weekId: string) => {
    navigate(`/week/${weekId}`);
  };

  // Filter tasks for this week
  const weekTasks = useMemo(() => {
    return state.tasks.filter((task) => {
      if (task.weekId !== activeWeekId) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status))
        return false;
      if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority))
        return false;
      if (
        filters.personIds.length > 0 &&
        (!task.assigneeId || !filters.personIds.includes(task.assigneeId))
      )
        return false;
      return true;
    });
  }, [state.tasks, activeWeekId, filters]);

  // Group tasks by project
  const projectTaskMap = useMemo(() => {
    const map = new Map<string, typeof weekTasks>();
    weekTasks.forEach((task) => {
      const existing = map.get(task.projectId) || [];
      existing.push(task);
      map.set(task.projectId, existing);
    });
    return map;
  }, [weekTasks]);

  // Projects that have tasks this week (or all projects for empty week)
  const activeProjects = useMemo(() => {
    return state.projects.filter((p) => projectTaskMap.has(p.id));
  }, [state.projects, projectTaskMap]);

  // Summary counts
  const activeCount = weekTasks.filter(
    (t) => t.status === 'in-progress' || t.status === 'code-review' || t.status === 'testing'
  ).length;
  const doneCount = weekTasks.filter(
    (t) => t.status === 'done' || t.status === 'released'
  ).length;
  const blockedCount = weekTasks.filter((t) => t.status === 'blocked').length;
  const workstreamCount = activeProjects.length;

  // Risks and actions for this week
  const weekRisks = state.risks.filter(
    (r) => r.weekId === activeWeekId && r.status === 'open'
  );
  const weekActions = state.actions.filter(
    (a) => a.weekId === activeWeekId && !a.completed
  );

  const currentWeek = state.weeks.find((w) => w.id === activeWeekId);

  return (
    <div className="flex-col gap-lg">
      <WeekTabs activeWeekId={activeWeekId} onSelectWeek={handleSelectWeek} />

      {/* Summary Cards */}
      <div className="flex gap-md">
        <div className="health-card" style={{ flex: 1 }}>
          <div className="health-card__stat">
            <span className="health-card__stat-value">{activeCount}</span>
            <span className="health-card__stat-label">Active</span>
          </div>
        </div>
        <div className="health-card" style={{ flex: 1 }}>
          <div className="health-card__stat">
            <span className="health-card__stat-value">{doneCount}</span>
            <span className="health-card__stat-label">Done</span>
          </div>
        </div>
        <div className="health-card" style={{ flex: 1 }}>
          <div className="health-card__stat">
            <span className="health-card__stat-value">{blockedCount}</span>
            <span className="health-card__stat-label">Blocked</span>
          </div>
        </div>
        <div className="health-card" style={{ flex: 1 }}>
          <div className="health-card__stat">
            <span className="health-card__stat-value">{workstreamCount}</span>
            <span className="health-card__stat-label">Workstreams</span>
          </div>
        </div>
      </div>

      <FilterBar />

      {/* Workstream blocks */}
      {activeProjects.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📋</span>
          <span className="empty-state__text">
            No tasks for {currentWeek?.label || 'this week'} yet
          </span>
        </div>
      ) : (
        activeProjects.map((project) => (
          <WorkstreamBlock
            key={project.id}
            project={project}
            tasks={projectTaskMap.get(project.id) || []}
            weekId={activeWeekId}
            onTaskClick={(taskId) => setDetailTaskId(taskId)}
          />
        ))
      )}

      {/* Risks and Actions */}
      {weekRisks.length > 0 && (
        <div className="risk-summary">
          <div className="risk-summary__title">Open Risks</div>
          {weekRisks.map((risk) => (
            <div key={risk.id} className="risk-summary__item">
              <span
                className={`risk-summary__severity risk-summary__severity--${risk.severity}`}
              >
                {risk.severity}
              </span>
              <span>{risk.title}</span>
            </div>
          ))}
        </div>
      )}

      {weekActions.length > 0 && (
        <div className="health-card mt-md">
          <div className="health-card__header">
            <span className="health-card__name">Action Items</span>
          </div>
          {weekActions.map((action) => {
            const owner = state.people.find((p) => p.id === action.assigneeId);
            return (
              <div key={action.id} className="flex gap-sm mb-sm">
                <span className="text-sm">{action.title}</span>
                {owner && (
                  <span className="text-xs text-muted">({owner.initials})</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TaskDetailModal taskId={detailTaskId} onClose={() => setDetailTaskId(null)} />
    </div>
  );
}
