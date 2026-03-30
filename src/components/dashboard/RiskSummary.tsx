import React from 'react';
import { useTracker } from '../../store/TrackerContext';

export const RiskSummary: React.FC = () => {
  const { state } = useTracker();

  const openRisks = state.risks.filter((r) => r.status === 'open');

  if (openRisks.length === 0) return null;

  const highRisks = openRisks.filter((r) => r.severity === 'high');
  const mediumRisks = openRisks.filter((r) => r.severity === 'medium');
  const lowRisks = openRisks.filter((r) => r.severity === 'low');

  const grouped = [
    { label: 'High', risks: highRisks, severity: 'high' as const },
    { label: 'Medium', risks: mediumRisks, severity: 'medium' as const },
    { label: 'Low', risks: lowRisks, severity: 'low' as const },
  ].filter((g) => g.risks.length > 0);

  const getProject = (projectId?: string) =>
    projectId ? state.projects.find((p) => p.id === projectId) : undefined;

  return (
    <div className="risk-summary">
      <div className="risk-summary__title">
        Open Risks ({openRisks.length})
      </div>
      {grouped.map((group) => (
        <div key={group.severity} style={{ marginBottom: 8 }}>
          {group.risks.map((risk) => {
            const project = getProject(risk.projectId);
            return (
              <div key={risk.id} className="risk-summary__item">
                <span className={`risk-summary__severity risk-summary__severity--${risk.severity}`}>
                  {group.label}
                </span>
                <span style={{ flex: 1 }}>{risk.title}</span>
                {project && (
                  <span
                    style={{
                      fontSize: 11,
                      color: project.color,
                      background: 'var(--surface)',
                      padding: '1px 6px',
                      borderRadius: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {project.shortName}
                  </span>
                )}
                <span
                  className="status-pill"
                  style={{
                    fontSize: 10,
                    background: 'var(--surface)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {risk.status}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
