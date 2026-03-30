import type { StandupChange } from '../../types';

interface ChangeReviewPanelProps {
  changes: StandupChange[];
  onToggle: (id: string) => void;
  onApply: () => void;
  onDiscard: () => void;
}

export function ChangeReviewPanel({ changes, onToggle, onApply, onDiscard }: ChangeReviewPanelProps) {
  const acceptedCount = changes.filter((c) => c.accepted).length;

  return (
    <div>
      <div className="text-sm text-dim" style={{ marginBottom: 8 }}>
        {acceptedCount} of {changes.length} changes selected
      </div>

      {changes.length === 0 ? (
        <div className="text-sm text-muted" style={{ padding: '20px 0', textAlign: 'center' }}>
          No actionable changes found.
        </div>
      ) : (
        <div className="change-list">
          {changes.map((change) => (
            <div
              key={change.id}
              className={`change-item${!change.accepted ? ' change-item--rejected' : ''}`}
            >
              <input
                type="checkbox"
                className="change-item__checkbox"
                checked={change.accepted}
                onChange={() => onToggle(change.id)}
              />
              <div className="change-item__body">
                <div className="change-item__description">{change.description}</div>
                <div className="change-item__detail">
                  <span className={`confidence-badge confidence-badge--${change.confidence}`}>
                    {change.confidence}
                  </span>
                  {' '}
                  <span className="text-muted">{change.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ai-panel__actions" style={{ marginTop: 16 }}>
        <button
          className="btn btn--accent btn--sm"
          onClick={onApply}
          disabled={acceptedCount === 0}
        >
          Apply {acceptedCount} Change{acceptedCount !== 1 ? 's' : ''}
        </button>
        <button className="btn btn--ghost btn--sm" onClick={onDiscard}>
          Discard All
        </button>
      </div>
    </div>
  );
}
