import React from 'react';
import { useTracker } from '../../store/TrackerContext';
import { WEEKS } from '../../data/constants';
import { ProjectHealthCard } from './ProjectHealthCard';
import { TimelineBar } from './TimelineBar';
import { RiskSummary } from './RiskSummary';

export const DashboardView: React.FC = () => {
  const { state } = useTracker();

  const totalTasks = state.tasks.length;
  const inProgressTasks = state.tasks.filter((t) => t.status === 'in-progress').length;
  const blockedTasks = state.tasks.filter((t) => t.status === 'blocked').length;
  const doneTasks = state.tasks.filter(
    (t) => t.status === 'done' || t.status === 'released'
  ).length;

  const firstWeek = WEEKS[0];
  const lastWeek = WEEKS[WEEKS.length - 1];
  const dateRange = `${firstWeek.startDate} - ${lastWeek.endDate}`;

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incyt-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    { label: 'Total Tasks', value: totalTasks, color: 'var(--text)' },
    { label: 'In Progress', value: inProgressTasks, color: 'var(--accent)' },
    { label: 'Blocked', value: blockedTasks, color: 'var(--red)' },
    { label: 'Done / Released', value: doneTasks, color: 'var(--green)' },
  ];

  return (
    <div className="flex-col gap-lg">
      {/* Header */}
      <div className="flex" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Program Dashboard
          </h1>
          <span className="text-sm text-muted">{dateRange}</span>
        </div>
        <button className="btn" onClick={handleExport}>
          Export JSON
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="health-card"
            style={{ padding: 16, textAlign: 'center' }}
          >
            <div
              className="health-card__stat-value"
              style={{ fontSize: 28, color: card.color }}
            >
              {card.value}
            </div>
            <div className="health-card__stat-label" style={{ marginTop: 4 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          10-Week Timeline
        </h2>
        <TimelineBar />
      </div>

      {/* Project Health Grid */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
          Project Health
        </h2>
        <div className="project-grid">
          {state.projects.map((project) => (
            <ProjectHealthCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Risks */}
      <RiskSummary />
    </div>
  );
};
