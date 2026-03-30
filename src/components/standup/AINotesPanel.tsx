import { useState, useRef } from 'react';
import type { StandupChange, Task, Priority } from '../../types';
import { useTracker } from '../../store/TrackerContext';
import { getAPIKey } from '../../store/persistence';
import { processStandupNotes } from '../../services/aiProcessor';
import { APIKeyInput } from './APIKeyInput';

interface AINodesPanelProps {
  weekId: string;
}

export function AINotesPanel({ weekId }: AINodesPanelProps) {
  const { state, dispatch } = useTracker();
  const [notes, setNotes] = useState('');
  const [changes, setChanges] = useState<StandupChange[]>([]);
  const [phase, setPhase] = useState<'input' | 'processing' | 'preview'>('input');
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(!!getAPIKey());
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setNotes((prev) => prev + (prev ? '\n\n' : '') + (evt.target?.result as string));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProcess = async () => {
    const apiKey = getAPIKey();
    if (!apiKey || !notes.trim()) return;

    setPhase('processing');
    setError(null);

    try {
      const result = await processStandupNotes(notes, state, weekId, apiKey);
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
                id: `task-ai-${Date.now()}-${newTaskCount}`,
                order: state.tasks.filter((t) => t.weekId === change.newTask!.weekId && t.projectId === change.newTask!.projectId).length,
              } as Task,
            });
          }
          break;
        case 'add_risk':
          if (change.newRisk) {
            dispatch({
              type: 'ADD_RISK',
              payload: { ...change.newRisk, id: `risk-ai-${Date.now()}` },
            });
          }
          break;
        case 'add_action':
          if (change.newAction) {
            dispatch({
              type: 'ADD_ACTION',
              payload: { ...change.newAction, id: `action-ai-${Date.now()}` },
            });
          }
          break;
      }
    }

    // Reset to input
    setNotes('');
    setChanges([]);
    setPhase('input');
  };

  const handleDiscard = () => {
    setChanges([]);
    setPhase('input');
  };

  const acceptedCount = changes.filter((c) => c.accepted).length;

  return (
    <div className="ai-panel">
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
          AI Notes Processor
        </h3>
      </div>

      <APIKeyInput onKeySet={() => setHasKey(true)} />

      {phase === 'input' && (
        <>
          <textarea
            className="ai-panel__textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your standup or meeting notes here...&#10;&#10;Example: Simon said winch firmware is done. Chris is blocked on pump control waiting for PCB. New task: Leon to test BN unit 5."
          />
          <div className="ai-panel__actions">
            <button
              className="btn btn--accent btn--sm"
              disabled={!notes.trim() || !hasKey}
              onClick={handleProcess}
            >
              Process Notes
            </button>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => fileRef.current?.click()}
            >
              Upload File
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.text"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            {!hasKey && (
              <span className="text-sm text-muted">Set API key above to process notes</span>
            )}
          </div>
          {error && (
            <div className="mt-sm" style={{ color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}
        </>
      )}

      {phase === 'processing' && (
        <div className="flex-col gap-sm" style={{ alignItems: 'center', padding: '40px 0' }}>
          <div className="ai-spinner" />
          <span className="text-sm text-dim">Analyzing meeting notes...</span>
        </div>
      )}

      {phase === 'preview' && (
        <>
          <div className="text-sm text-dim" style={{ marginBottom: 8 }}>
            {acceptedCount} of {changes.length} changes selected
          </div>

          {changes.length === 0 ? (
            <div className="text-sm text-muted" style={{ padding: '20px 0', textAlign: 'center' }}>
              No actionable changes found in the notes.
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
                    onChange={() => toggleChange(change.id)}
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
              onClick={handleApply}
              disabled={acceptedCount === 0}
            >
              Apply {acceptedCount} Change{acceptedCount !== 1 ? 's' : ''}
            </button>
            <button className="btn btn--ghost btn--sm" onClick={handleDiscard}>
              Discard All
            </button>
          </div>
        </>
      )}
    </div>
  );
}
