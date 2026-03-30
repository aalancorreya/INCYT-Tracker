import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TrackerProvider } from './store/TrackerContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { WeekView } from './components/week/WeekView';
import { KanbanView } from './components/kanban/KanbanView';
import { StandupView } from './components/standup/StandupView';
import { AdminView } from './components/admin/AdminView';
import { DailyUpdateView } from './components/updates/DailyUpdateView';

export function App() {
  return (
    <TrackerProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="week" element={<WeekView />} />
            <Route path="week/:weekId" element={<WeekView />} />
            <Route path="standup" element={<StandupView />} />
            <Route path="standup/:mode" element={<StandupView />} />
            <Route path="kanban" element={<KanbanView />} />
            <Route path="admin" element={<AdminView />} />
            <Route path="updates" element={<DailyUpdateView />} />
          </Route>
        </Routes>
      </HashRouter>
    </TrackerProvider>
  );
}
