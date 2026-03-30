import { useState, useMemo } from 'react';
import type { Task, Project, TaskStatus } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { WEEKS, STATUS_CONFIG } from '../../data/constants';

interface WeekCell {
  total: number;
  done: number;
  inProgress: number;
  blocked: number;
  todo: number;
}

type TeamFilter = 'all' | 'device' | 'software';

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  normal: 2,
  stretch: 3,
};

function computeWeekCell(tasks: Task[]): WeekCell {
  let done = 0;
  let inProgress = 0;
  let blocked = 0;
  let todo = 0;

  for (const t of tasks) {
    if (t.status === 'done' || t.status === 'released') done++;
    else if (t.status === 'in-progress' || t.status === 'code-review' || t.status === 'testing') inProgress++;
    else if (t.status === 'blocked') blocked++;
    else todo++;
  }

  return { total: tasks.length, done, inProgress, blocked, todo };
}

const LEGEND_ITEMS: { label: string; color: string }[] = [
  { label: 'Done / Released', color: STATUS_CONFIG.done.color },
  { label: 'In Progress', color: STATUS_CONFIG['in-progress'].color },
  { label: 'Blocked', color: STATUS_CONFIG.blocked.color },
  { label: 'To Do', color: STATUS_CONFIG.todo.color },
];

export const RoadmapView: React.FC = () => {
  const { state, getCurrentWeek } = useTracker();
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('all');

  const currentWeekId = getCurrentWeek();

  // Build per-project, per-week data
  const projectData = useMemo(() => {
    // Filter projects by team
    const filteredProjects = teamFilter === 'all'
      ? state.projects
      : state.projects.filter((p) =>
          teamFilter === 'device' ? p.isDeviceOnly : !p.isDeviceOnly
        );

    // Group tasks by project + week
    const tasksByProjectWeek = new Map<string, Map<string, Task[]>>();
    for (const task of state.tasks) {
      if (!tasksByProjectWeek.has(task.projectId)) {
        tasksByProjectWeek.set(task.projectId, new Map());
      }
      const weekMap = tasksByProjectWeek.get(task.projectId)!;
      if (!weekMap.has(task.weekId)) {
        weekMap.set(task.weekId, []);
      }
      weekMap.get(task.weekId)!.push(task);
    }

    // Build data for each project
    const rows = filteredProjects.map((project) => {
      const weekMap = tasksByProjectWeek.get(project.id);
      const cells = new Map<string, WeekCell>();
      let totalTasks = 0;
      let totalDone = 0;
      let hasAnyTasks = false;

      for (const week of WEEKS) {
        const tasks = weekMap?.get(week.id) || [];
        if (tasks.length > 0) {
          hasAnyTasks = true;
          const cell = computeWeekCell(tasks);
          cells.set(week.id, cell);
          totalTasks += cell.total;
          totalDone += cell.done;
        }
      }

      return { project, cells, totalTasks, totalDone, hasAnyTasks };
    });

    // Sort: active projects first, then by priority, then alphabetical
    rows.sort((a, b) => {
      if (a.hasAnyTasks !== b.hasAnyTasks) return a.hasAnyTasks ? -1 : 1;
      const pa = PRIORITY_ORDER[a.project.priority] ?? 2;
      const pb = PRIORITY_ORDER[b.project.priority] ?? 2;
      if (pa !== pb) return pa - pb;
      return a.project.shortName.localeCompare(b.project.shortName);
    });

    return rows;
  }, [state.projects, state.tasks, teamFilter]);

  // Summary row
  const summaryRow = useMemo(() => {
    const cells = new Map<string, WeekCell>();
    for (const week of WEEKS) {
      let total = 0, done = 0, inProgress = 0, blocked = 0, todo = 0;
      for (const row of projectData) {
        const cell = row.cells.get(week.id);
        if (cell) {
          total += cell.total;
          done += cell.done;
          inProgress += cell.inProgress;
          blocked += cell.blocked;
          todo += cell.todo;
        }
      }
      if (total > 0) {
        cells.set(week.id, { total, done, inProgress, blocked, todo });
      }
    }
    return cells;
  }, [projectData]);

  return (
    <div className="flex-col gap-lg">
      {/* Header */}
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Program Roadmap
        </h1>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value as TeamFilter)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Teams</option>
          <option value="device">Device</option>
          <option value="software">Software</option>
        </select>
      </div>

      {/* Grid container */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '180px repeat(10, minmax(80px, 1fr))',
            minWidth: 1060,
          }}
        >
          {/* Header row */}
          <div
            style={{
              padding: '10px 12px',
              fontWeight: 600,
              fontSize: 13,
              color: 'var(--text-muted)',
              borderBottom: '2px solid var(--border)',
              position: 'sticky',
              left: 0,
              background: 'var(--surface)',
              zIndex: 2,
            }}
          >
            Project
          </div>
          {WEEKS.map((week) => {
            const isCurrent = week.id === currentWeekId;
            return (
              <div
                key={week.id}
                style={{
                  padding: '10px 8px',
                  fontWeight: 600,
                  fontSize: 13,
                  color: isCurrent ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: '2px solid var(--border)',
                  textAlign: 'center',
                  background: isCurrent ? 'rgba(108,138,255,0.06)' : 'transparent',
                  borderLeft: isCurrent ? '2px solid var(--accent)' : undefined,
                  borderRight: isCurrent ? '2px solid var(--accent)' : undefined,
                }}
              >
                {week.label}
                {week.note && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 400,
                      color: 'var(--text-muted)',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={week.note}
                  >
                    {week.note}
                  </div>
                )}
              </div>
            );
          })}

          {/* Project rows */}
          {projectData.map((row) => (
            <ProjectRow
              key={row.project.id}
              project={row.project}
              cells={row.cells}
              totalTasks={row.totalTasks}
              totalDone={row.totalDone}
              currentWeekId={currentWeekId}
            />
          ))}

          {/* Summary row */}
          <div
            style={{
              padding: '10px 12px',
              fontWeight: 600,
              fontSize: 12,
              color: 'var(--text-muted)',
              borderTop: '2px solid var(--border)',
              position: 'sticky',
              left: 0,
              background: 'var(--surface)',
              zIndex: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Totals
          </div>
          {WEEKS.map((week) => {
            const cell = summaryRow.get(week.id);
            const isCurrent = week.id === currentWeekId;
            return (
              <div
                key={week.id}
                style={{
                  padding: '8px 6px',
                  borderTop: '2px solid var(--border)',
                  textAlign: 'center',
                  background: isCurrent ? 'rgba(108,138,255,0.06)' : 'transparent',
                  borderLeft: isCurrent ? '2px solid var(--accent)' : undefined,
                  borderRight: isCurrent ? '2px solid var(--accent)' : undefined,
                }}
              >
                {cell ? (
                  <>
                    <StatusBar cell={cell} />
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 3,
                        fontWeight: 600,
                      }}
                    >
                      {cell.done}/{cell.total}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex"
        style={{
          gap: 16,
          alignItems: 'center',
          padding: '8px 0',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Key:</span>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex" style={{ gap: 6, alignItems: 'center' }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: item.color,
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────── */

function ProjectRow({
  project,
  cells,
  totalTasks,
  totalDone,
  currentWeekId,
}: {
  project: Project;
  cells: Map<string, WeekCell>;
  totalTasks: number;
  totalDone: number;
  currentWeekId: string;
}) {
  return (
    <>
      {/* Project name cell */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          position: 'sticky',
          left: 0,
          background: 'var(--surface)',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: project.color,
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={project.name}
          >
            {project.shortName}
          </div>
          {totalTasks > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {totalDone}/{totalTasks} done
            </div>
          )}
        </div>
      </div>

      {/* Week cells */}
      {WEEKS.map((week) => {
        const cell = cells.get(week.id);
        const isCurrent = week.id === currentWeekId;
        const hasBlocked = cell ? cell.blocked > 0 : false;

        return (
          <div
            key={week.id}
            style={{
              padding: '8px 6px',
              borderBottom: '1px solid var(--border)',
              textAlign: 'center',
              background: isCurrent ? 'rgba(108,138,255,0.06)' : 'transparent',
              borderLeft: isCurrent
                ? '2px solid var(--accent)'
                : hasBlocked
                  ? '2px solid ' + STATUS_CONFIG.blocked.color
                  : undefined,
              borderRight: isCurrent
                ? '2px solid var(--accent)'
                : hasBlocked
                  ? '2px solid ' + STATUS_CONFIG.blocked.color
                  : undefined,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
            }}
          >
            {cell ? (
              <>
                <StatusBar cell={cell} />
                <div
                  style={{
                    fontSize: 11,
                    color: hasBlocked ? STATUS_CONFIG.blocked.color : 'var(--text-muted)',
                    marginTop: 3,
                    fontWeight: hasBlocked ? 600 : 400,
                  }}
                >
                  {cell.done}/{cell.total}
                </div>
              </>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function StatusBar({ cell }: { cell: WeekCell }) {
  if (cell.total === 0) return null;

  const segments: { count: number; color: string }[] = [
    { count: cell.done, color: STATUS_CONFIG.done.color },
    { count: cell.inProgress, color: STATUS_CONFIG['in-progress'].color },
    { count: cell.blocked, color: STATUS_CONFIG.blocked.color },
    { count: cell.todo, color: STATUS_CONFIG.todo.color },
  ];

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        background: 'rgba(139,143,163,0.12)',
      }}
    >
      {segments.map(
        (seg, i) =>
          seg.count > 0 && (
            <div
              key={i}
              style={{
                flex: seg.count,
                background: seg.color,
              }}
            />
          )
      )}
    </div>
  );
}
