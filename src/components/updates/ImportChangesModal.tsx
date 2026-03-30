import { useState } from 'react';
import type { StandupChange } from '../../types';
import { Modal } from '../shared/Modal';

interface ImportChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (changes: StandupChange[]) => void;
}

export function ImportChangesModal({ isOpen, onClose, onImport }: ImportChangesModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setError('JSON must be an array of changes.');
        return;
      }

      const changes: StandupChange[] = parsed.map((item: Record<string, unknown>, i: number) => ({
        id: (item.id as string) || `import-${Date.now()}-${i}`,
        type: item.type,
        confidence: item.confidence || 'medium',
        description: item.description || '',
        accepted: item.accepted !== undefined ? item.accepted : true,
        ...(item.taskUpdate && { taskUpdate: item.taskUpdate }),
        ...(item.newTask && { newTask: item.newTask }),
        ...(item.newRisk && { newRisk: item.newRisk }),
        ...(item.newAction && { newAction: item.newAction }),
        ...(item.moveTask && { moveTask: item.moveTask }),
      })) as StandupChange[];

      onImport(changes);
      setText('');
      setError(null);
    } catch {
      setError('Invalid JSON. Please check the format and try again.');
    }
  };

  const handleClose = () => {
    setText('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Changes"
      size="lg"
      footer={
        <div className="flex gap-sm">
          <button className="btn btn--accent btn--sm" onClick={handleSubmit} disabled={!text.trim()}>
            Import
          </button>
          <button className="btn btn--ghost btn--sm" onClick={handleClose}>
            Cancel
          </button>
        </div>
      }
    >
      <textarea
        className="ai-panel__textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Paste a JSON array of StandupChange objects...&#10;&#10;[{ "type": "update_task", "confidence": "high", "description": "...", "taskUpdate": { "taskId": "...", "updates": { "status": "done" } } }]'
        style={{ minHeight: 200 }}
      />
      {error && (
        <div className="mt-sm" style={{ color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      )}
    </Modal>
  );
}
