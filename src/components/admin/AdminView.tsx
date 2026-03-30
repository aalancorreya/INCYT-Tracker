import { useState } from 'react';
import type { AdminTab } from '../../types';
import { ProjectsTable } from './ProjectsTable';
import { PeopleTable } from './PeopleTable';
import { WeeksTable } from './WeeksTable';
import { RisksTable } from './RisksTable';
import { ActionsTable } from './ActionsTable';
import { ApiConfigPanel } from '../shared/ApiConfigPanel';
import { useTracker } from '../../store/TrackerContext';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'people', label: 'People' },
  { key: 'weeks', label: 'Weeks' },
  { key: 'risks', label: 'Risks' },
  { key: 'actions', label: 'Actions' },
];

export function AdminView() {
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const { syncNow } = useTracker();

  return (
    <div className="flex-col gap-lg">
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
        Data Admin
      </h1>

      <ApiConfigPanel onConnect={() => syncNow()} />

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tabs__btn${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'projects' && <ProjectsTable />}
      {activeTab === 'people' && <PeopleTable />}
      {activeTab === 'weeks' && <WeeksTable />}
      {activeTab === 'risks' && <RisksTable />}
      {activeTab === 'actions' && <ActionsTable />}
    </div>
  );
}
