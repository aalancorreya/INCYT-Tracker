import { useState, useRef } from 'react';
import type { UpdateSource, UpdateSourceType } from '../../types';

interface SourceInputPanelProps {
  sources: UpdateSource[];
  onChange: (sources: UpdateSource[]) => void;
  onProcess: () => void;
  processing: boolean;
  hasKey: boolean;
}

const SOURCE_TYPE_LABELS: Record<UpdateSourceType, string> = {
  'meeting-notes': 'Meeting Notes',
  'slack': 'Slack',
  'email': 'Email',
  'calendar': 'Calendar',
  'spreadsheet': 'Spreadsheet',
  'other': 'Other',
};

const SOURCE_PLACEHOLDERS: Record<UpdateSourceType, string> = {
  'meeting-notes': 'Paste your meeting notes here...',
  'slack': 'Paste Slack messages or thread here...',
  'email': 'Paste email content here...',
  'calendar': 'Paste calendar notes or agenda here...',
  'spreadsheet': 'Paste spreadsheet data here...',
  'other': 'Paste content here...',
};

const SOURCE_TYPE_OPTIONS: UpdateSourceType[] = [
  'meeting-notes', 'slack', 'email', 'calendar', 'spreadsheet', 'other',
];

export function SourceInputPanel({ sources, onChange, onProcess, processing, hasKey }: SourceInputPanelProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addSource = (type: UpdateSourceType) => {
    const newSource: UpdateSource = {
      id: `source-${Date.now()}`,
      type,
      label: SOURCE_TYPE_LABELS[type],
      content: '',
    };
    onChange([...sources, newSource]);
    setDropdownOpen(false);
  };

  const updateSource = (id: string, updates: Partial<UpdateSource>) => {
    onChange(sources.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSource = (id: string) => {
    onChange(sources.filter((s) => s.id !== id));
  };

  const handleFileUpload = (sourceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      updateSource(sourceId, {
        content: evt.target?.result as string,
        fileName: file.name,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const hasContent = sources.some((s) => s.content.trim().length > 0);

  return (
    <div>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn--accent btn--sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            + Add Source
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, marginTop: 4, minWidth: 160, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
              {SOURCE_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  className="dropdown-item"
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}
                  onClick={() => addSource(type)}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--hover)'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'none'; }}
                >
                  {SOURCE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {sources.length === 0 && (
        <div className="text-sm text-muted" style={{ padding: '20px 0', textAlign: 'center' }}>
          Add a source to get started.
        </div>
      )}

      {sources.map((source) => (
        <div key={source.id} className="source-card" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div className="source-card__header flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
              <span className="text-sm text-dim" style={{ fontWeight: 600 }}>
                {SOURCE_TYPE_LABELS[source.type]}
              </span>
              <input
                className="form-input"
                style={{ fontSize: 13, padding: '2px 6px', maxWidth: 180 }}
                value={source.label}
                onChange={(e) => updateSource(source.id, { label: e.target.value })}
              />
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => fileRefs.current[source.id]?.click()}
              >
                Upload
              </button>
              <input
                ref={(el) => { fileRefs.current[source.id] = el; }}
                type="file"
                accept=".txt,.md"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(source.id, e)}
              />
              {source.fileName && (
                <span className="text-sm text-dim">{source.fileName}</span>
              )}
            </div>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => removeSource(source.id)}
              style={{ color: 'var(--red)', fontWeight: 700 }}
            >
              X
            </button>
          </div>
          <textarea
            className="ai-panel__textarea"
            value={source.content}
            onChange={(e) => updateSource(source.id, { content: e.target.value })}
            placeholder={SOURCE_PLACEHOLDERS[source.type]}
            style={{ minHeight: 100 }}
          />
        </div>
      ))}

      {sources.length > 0 && (
        <div className="ai-panel__actions" style={{ marginTop: 12 }}>
          <button
            className="btn btn--accent btn--sm"
            disabled={!hasContent || !hasKey || processing}
            onClick={onProcess}
          >
            {processing ? (
              <>
                <span className="ai-spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                Processing...
              </>
            ) : (
              'Process All Sources'
            )}
          </button>
          {!hasKey && (
            <span className="text-sm text-muted">Set API key above to process sources</span>
          )}
        </div>
      )}
    </div>
  );
}
