import React from 'react';
import { useTracker } from '../../store/TrackerContext';
import { WEEKS } from '../../data/constants';

export const TimelineBar: React.FC = () => {
  const { state, getCurrentWeek } = useTracker();
  const currentWeekId = getCurrentWeek();

  return (
    <div className="timeline-bar">
      {WEEKS.map((week) => {
        const weekTasks = state.tasks.filter((t) => t.weekId === week.id);
        const totalTasks = weekTasks.length;
        const doneTasks = weekTasks.filter(
          (t) => t.status === 'done' || t.status === 'released'
        ).length;
        const hasBlocked = weekTasks.some((t) => t.status === 'blocked');
        const isCurrent = week.id === currentWeekId;
        const doneRatio = totalTasks > 0 ? doneTasks / totalTasks : 0;

        let segmentClass = 'timeline-bar__segment';
        if (isCurrent) {
          segmentClass += ' timeline-bar__segment--active';
        } else if (doneRatio > 0.5) {
          segmentClass += ' timeline-bar__segment--done';
        } else if (totalTasks === 0) {
          segmentClass += ' timeline-bar__segment--future';
        }

        return (
          <div
            key={week.id}
            className={segmentClass}
            style={hasBlocked ? { borderColor: 'var(--red)', borderWidth: 2, borderStyle: 'solid' } : undefined}
            title={`${week.label}: ${doneTasks}/${totalTasks} done${hasBlocked ? ' (has blocked)' : ''}`}
          >
            {week.label}
            {isCurrent && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 8,
                  color: 'var(--accent)',
                }}
              >
                &#9650;
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
