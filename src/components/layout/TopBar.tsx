import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTracker } from '../../store/TrackerContext';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/roadmap': 'Roadmap',
  '/week': 'Week View',
  '/standup': 'Standup',
  '/kanban': 'Kanban Board',
  '/updates': 'Daily Updates',
  '/admin': 'Data Admin',
};

const SYNC_LABELS: Record<string, { label: string; color: string }> = {
  local: { label: 'Local', color: 'var(--text-muted)' },
  syncing: { label: 'Syncing...', color: 'var(--amber)' },
  synced: { label: 'Synced', color: 'var(--green)' },
  error: { label: 'Sync Error', color: 'var(--red)' },
};

export function TopBar() {
  const location = useLocation();
  const { state, filters, setFilters, selectedWeekId, setSelectedWeekId, exportJSON, importJSON, syncStatus } = useTracker();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = ROUTE_TITLES[location.pathname] || 'INCYT Tracker';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchQuery: e.target.value });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        importJSON(data);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>

      <div className="topbar__separator" />

      <select
        className="topbar__week-select"
        value={selectedWeekId}
        onChange={(e) => setSelectedWeekId(e.target.value)}
      >
        {state.weeks.map((week) => (
          <option key={week.id} value={week.id}>
            W{week.number}: {week.label}
          </option>
        ))}
      </select>

      <div className="topbar__search">
        <span className="topbar__search-icon">&#x1F50D;</span>
        <input
          type="text"
          className="topbar__search-input"
          placeholder="Search tasks..."
          value={filters.searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="topbar__spacer" />

      <span style={{ fontSize: 11, fontWeight: 500, color: SYNC_LABELS[syncStatus].color, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: SYNC_LABELS[syncStatus].color, display: 'inline-block' }} />
        {SYNC_LABELS[syncStatus].label}
      </span>

      <button className="topbar__btn" onClick={exportJSON}>
        Export JSON
      </button>

      <button
        className="topbar__btn"
        onClick={() => fileInputRef.current?.click()}
      >
        Import JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="topbar__import-input"
        onChange={handleImport}
      />
    </header>
  );
}
