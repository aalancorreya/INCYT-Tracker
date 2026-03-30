import { WEEKS } from '../../data/constants';
import { useTracker } from '../../store/TrackerContext';

interface WeekTabsProps {
  activeWeekId: string;
  onSelectWeek: (weekId: string) => void;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const startStr = start.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  return `${startStr} - ${endStr}`;
}

export function WeekTabs({ activeWeekId, onSelectWeek }: WeekTabsProps) {
  const { getCurrentWeek } = useTracker();
  const currentWeekId = getCurrentWeek();

  return (
    <div className="week-tabs">
      {WEEKS.map((week) => {
        const isActive = week.id === activeWeekId;
        const isCurrent = week.id === currentWeekId;
        const classes = [
          'week-tab',
          isActive ? 'active' : '',
          isCurrent ? 'current' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={week.id}
            className={classes}
            onClick={() => onSelectWeek(week.id)}
          >
            <span className="week-tab__dot" />
            <span>{week.label}</span>
            <span className="text-xs text-muted">
              {formatDateRange(week.startDate, week.endDate)}
            </span>
            {week.note && (
              <span className="text-xs text-dim">({week.note})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
