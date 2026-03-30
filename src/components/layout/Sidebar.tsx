import { NavLink } from 'react-router-dom';
import { useTracker } from '../../store/TrackerContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '\u{1F4CA}', label: 'Dashboard' },
  { to: '/roadmap', icon: '\u{1F5FA}\uFE0F', label: 'Roadmap' },
  { to: '/week', icon: '\u{1F4C5}', label: 'Week View' },
  { to: '/standup', icon: '\u{1F4CB}', label: 'Standup' },
  { to: '/kanban', icon: '\u{1F5C2}\uFE0F', label: 'Kanban Board' },
  { to: '/updates', icon: '\u{1F4E5}', label: 'Daily Updates' },
  { to: '/admin', icon: '\u2699\uFE0F', label: 'Data Admin' },
];

export function Sidebar() {
  const { state, filters, setFilters } = useTracker();

  const toggleProject = (projectId: string) => {
    const current = filters.projectIds;
    const next = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId];
    setFilters({ ...filters, projectIds: next });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">I</div>
        <div>
          <div className="sidebar__logo-text">INCYT</div>
          <div className="sidebar__logo-sub">Program Tracker</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Views</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__nav-link${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__projects">
        <div className="sidebar__projects-title">Projects</div>
        {state.projects.map((project) => {
          const isChecked =
            filters.projectIds.length === 0 ||
            filters.projectIds.includes(project.id);
          return (
            <label key={project.id} className="sidebar__project-item">
              <input
                type="checkbox"
                className="sidebar__project-checkbox"
                checked={isChecked}
                onChange={() => toggleProject(project.id)}
              />
              <span
                className="sidebar__project-dot"
                style={{ background: project.color }}
              />
              <span className="truncate">{project.shortName}</span>
            </label>
          );
        })}
      </div>
    </aside>
  );
}
