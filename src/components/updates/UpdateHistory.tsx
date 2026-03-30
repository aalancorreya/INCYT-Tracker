import { useState, useEffect } from 'react';
import type { DailyUpdate } from '../../types';
import { loadUpdates } from '../../store/updateHistory';

interface UpdateHistoryProps {
  onSelect: (update: DailyUpdate) => void;
}

export function UpdateHistory({ onSelect }: UpdateHistoryProps) {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);

  useEffect(() => {
    setUpdates(loadUpdates());
  }, []);

  if (updates.length === 0) {
    return (
      <div className="text-sm text-muted" style={{ padding: '20px 0', textAlign: 'center' }}>
        No updates yet
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, DailyUpdate[]> = {};
  for (const update of updates) {
    const dateKey = update.date.slice(0, 10);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(update);
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
        Update History
      </h3>
      {sortedDates.map((date) => (
        <div key={date} style={{ marginBottom: 12 }}>
          <div className="text-sm text-dim" style={{ fontWeight: 600, marginBottom: 4 }}>
            {new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          {grouped[date].map((update) => (
            <button
              key={update.id}
              className="btn btn--ghost"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '6px 8px',
                marginBottom: 2,
                borderRadius: 6,
                fontSize: 13,
              }}
              onClick={() => onSelect(update)}
            >
              <div style={{ color: 'var(--text)' }}>
                {new Date(update.date).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' '}
                <span className="text-dim">
                  ({update.changes.length} change{update.changes.length !== 1 ? 's' : ''})
                </span>
              </div>
              {update.summary && (
                <div className="text-sm text-muted" style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {update.summary.slice(0, 80)}
                  {update.summary.length > 80 ? '...' : ''}
                </div>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
