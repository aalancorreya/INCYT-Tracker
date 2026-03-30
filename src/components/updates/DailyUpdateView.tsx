import { useState } from 'react';
import type { UpdateSource, StandupChange, DailyUpdate, Task } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { getAPIKey } from '../../store/persistence';
import { processDailyUpdate } from '../../services/dailyUpdateProcessor';
import { saveUpdate } from '../../store/updateHistory';
import { SourceInputPanel } from './SourceInputPanel';
import { ChangeReviewPanel } from './ChangeReviewPanel';
import { UpdateHistory } from './UpdateHistory';
import { ImportChangesModal } from './ImportChangesModal';
import { APIKeyInput } from '../standup/APIKeyInput';
import { IntegrationSettings, getSlackToken, getSlackChannels, getJiraCredentials } from './IntegrationSettings';
import { pullSlackMessages } from '../../services/slackPull';
import { pullJiraUpdates } from '../../services/jiraPull';

export function DailyUpdateView() {
  const { state, dispatch, getCurrentWeek } = useTracker();
  const [sources, setSources] = useState<UpdateSource[]>([]);
  const [changes, setChanges] = useState<StandupChange[]>([]);
  const [phase, setPhase] = useState<'input' | 'processing' | 'preview'>('input');
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(!!getAPIKey());
  const [showImport, setShowImport] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<DailyUpdate | null>(null);

  const weekId = getCurrentWeek();

  const handleProcess = async () => {
    const apiKey = getAPIKey();
    const sourcesWithContent = sources.filter((s) => s.content.trim().length > 0);
    if (!apiKey || sourcesWithContent.length === 0) return;

    setPhase('processing');
    setError(null);

    try {
      const result = await processDailyUpdate(sources, state, weekId, apiKey);
      setChanges(result);
      setPhase('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPhase('input');
    }
  };

  const toggleChange = (id: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, accepted: !c.accepted } : c))
    );
  };

  const handleApply = () => {
    const accepted = changes.filter((c) => c.accepted);
    let newTaskCount = 0;

    for (const change of accepted) {
      switch (change.type) {
        case 'update_task':
          if (change.taskUpdate) {
            dispatch({
              type: 'UPDATE_TASK',
              payload: { id: change.taskUpdate.taskId, updates: change.taskUpdate.updates },
            });
          }
          break;
        case 'move_task':
          if (change.moveTask) {
            dispatch({
              type: 'MOVE_TASK',
              payload: change.moveTask,
            });
          }
          break;
        case 'create_task':
          if (change.newTask) {
            newTaskCount++;
            dispatch({
              type: 'ADD_TASK',
              payload: {
                ...change.newTask,
                id: `task-daily-${Date.now()}-${newTaskCount}`,
                order: state.tasks.filter(
                  (t) => t.weekId === change.newTask!.weekId && t.projectId === change.newTask!.projectId
                ).length,
              } as Task,
            });
          }
          break;
        case 'add_risk':
          if (change.newRisk) {
            dispatch({
              type: 'ADD_RISK',
              payload: { ...change.newRisk, id: `risk-daily-${Date.now()}` },
            });
          }
          break;
        case 'add_action':
          if (change.newAction) {
            dispatch({
              type: 'ADD_ACTION',
              payload: { ...change.newAction, id: `action-daily-${Date.now()}` },
            });
          }
          break;
      }
    }

    // Save to history
    const dailyUpdate: DailyUpdate = {
      id: `update-${Date.now()}`,
      date: new Date().toISOString(),
      weekId,
      sources,
      changes: accepted,
      appliedAt: new Date().toISOString(),
      summary: accepted.map((c) => c.description).join('; ').slice(0, 200),
    };
    saveUpdate(dailyUpdate);

    // Reset state
    setSources([]);
    setChanges([]);
    setPhase('input');
  };

  const handleDiscard = () => {
    setChanges([]);
    setPhase('input');
  };

  const handleImport = (imported: StandupChange[]) => {
    setChanges(imported);
    setPhase('preview');
    setShowImport(false);
  };

  const handlePullExternal = async () => {
    const slackToken = getSlackToken();
    const channels = getSlackChannels();
    const jiraCreds = getJiraCredentials();

    if (!slackToken && !jiraCreds) {
      setShowIntegrations(true);
      return;
    }

    setPulling(true);
    const pulled: UpdateSource[] = [];

    try {
      if (slackToken && channels.length > 0) {
        const slackSources = await pullSlackMessages(slackToken, channels);
        pulled.push(...slackSources);
      }
      if (jiraCreds) {
        const jiraSource = await pullJiraUpdates(jiraCreds.email, jiraCreds.token, jiraCreds.domain);
        if (jiraSource) pulled.push(jiraSource);
      }
    } catch (err) {
      console.warn('Pull error:', err);
    }

    if (pulled.length > 0) {
      setSources((prev) => [...prev, ...pulled]);
    }
    setPulling(false);
  };

  const handleHistorySelect = (update: DailyUpdate) => {
    setSelectedHistory(update);
    setChanges(update.changes.map((c) => ({ ...c, accepted: true })));
    setPhase('preview');
  };

  return (
    <div className="flex-col gap-md">
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          Daily Update Hub
        </h1>
        <div className="flex gap-sm">
          <button
            className="btn btn--accent btn--sm"
            onClick={handlePullExternal}
            disabled={pulling || phase !== 'input'}
          >
            {pulling ? 'Pulling...' : 'Pull External Sources'}
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowIntegrations(true)}>
            Integrations
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowImport(true)}>
            Import JSON
          </button>
        </div>
      </div>

      <APIKeyInput onKeySet={() => setHasKey(true)} />

      <div className="daily-update" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div className="daily-update__main">
          {phase === 'input' && (
            <SourceInputPanel
              sources={sources}
              onChange={setSources}
              onProcess={handleProcess}
              processing={false}
              hasKey={hasKey}
            />
          )}

          {phase === 'processing' && (
            <div className="flex-col gap-sm" style={{ alignItems: 'center', padding: '40px 0' }}>
              <div className="ai-spinner" />
              <span className="text-sm text-dim">Processing update sources...</span>
            </div>
          )}

          {phase === 'preview' && (
            <ChangeReviewPanel
              changes={changes}
              onToggle={toggleChange}
              onApply={handleApply}
              onDiscard={handleDiscard}
            />
          )}

          {error && (
            <div className="mt-sm" style={{ color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        <div className="daily-update__sidebar" style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
          <UpdateHistory onSelect={handleHistorySelect} />
        </div>
      </div>

      <ImportChangesModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />

      <IntegrationSettings
        isOpen={showIntegrations}
        onClose={() => setShowIntegrations(false)}
      />
    </div>
  );
}
