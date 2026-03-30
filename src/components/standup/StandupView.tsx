import React, { useState, useMemo } from 'react';
import { useTracker } from '../../store/TrackerContext';
import { WEEKS } from '../../data/constants';
import { PersonCentricView } from './PersonCentricView';
import { ProjectCentricView } from './ProjectCentricView';
import { TaskDetailModal } from '../shared/TaskDetailModal';
import { AINotesPanel } from './AINotesPanel';

type StandupMode = 'person' | 'project';

export const StandupView: React.FC = () => {
  const { state, getCurrentWeek } = useTracker();
  const [mode, setMode] = useState<StandupMode>('person');
  const [weekId, setWeekId] = useState<string>(getCurrentWeek());
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);

  const handleToggle = (taskId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const weekTasks = useMemo(
    () => state.tasks.filter((t) => t.weekId === weekId),
    [state.tasks, weekId]
  );

  const discussedCount = checkedIds.size;
  const blockedCount = weekTasks.filter((t) => t.status === 'blocked').length;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex-col gap-md">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Daily Standup
        </h1>
        <span className="text-sm text-muted">{today}</span>
      </div>

      {/* Controls row */}
      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        {/* Toggle */}
        <div className="standup-toggle">
          <button
            className={`standup-toggle__btn${mode === 'person' ? ' active' : ''}`}
            onClick={() => setMode('person')}
          >
            By Person
          </button>
          <button
            className={`standup-toggle__btn${mode === 'project' ? ' active' : ''}`}
            onClick={() => setMode('project')}
          >
            By Project
          </button>
        </div>

        <button
          className={`btn btn--sm${showAI ? ' btn--accent' : ' btn--ghost'}`}
          onClick={() => setShowAI((v) => !v)}
        >
          AI Notes
        </button>

        {/* Week selector */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={weekId}
          onChange={(e) => {
            setWeekId(e.target.value);
            setCheckedIds(new Set());
          }}
        >
          {WEEKS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label} ({w.startDate})
            </option>
          ))}
        </select>
      </div>

      {showAI && <AINotesPanel weekId={weekId} />}

      {/* Content */}
      {mode === 'person' ? (
        <PersonCentricView
          weekId={weekId}
          checkedIds={checkedIds}
          onToggle={handleToggle}
          onTaskClick={(taskId) => setDetailTaskId(taskId)}
        />
      ) : (
        <ProjectCentricView
          weekId={weekId}
          checkedIds={checkedIds}
          onToggle={handleToggle}
          onTaskClick={(taskId) => setDetailTaskId(taskId)}
        />
      )}

      <TaskDetailModal taskId={detailTaskId} onClose={() => setDetailTaskId(null)} />

      {/* Summary footer */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          padding: '12px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          color: 'var(--text-dim)',
        }}
      >
        <span>
          Discussed: <strong style={{ color: 'var(--text)' }}>{discussedCount}</strong> / {weekTasks.length} tasks
        </span>
        <span>
          Blocked: <strong style={{ color: blockedCount > 0 ? 'var(--red)' : 'var(--text)' }}>{blockedCount}</strong>
        </span>
      </div>
    </div>
  );
};
