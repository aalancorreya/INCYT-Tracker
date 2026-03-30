import { useState } from 'react';
import { getApiUrl, setApiUrl, clearApiUrl, testConnection } from '../../services/appScriptSync';

interface ApiConfigPanelProps {
  onConnect: () => void;
}

export function ApiConfigPanel({ onConnect }: ApiConfigPanelProps) {
  const [urlInput, setUrlInput] = useState('');
  const [connected, setConnected] = useState(() => !!getApiUrl());
  const [currentUrl, setCurrentUrl] = useState(() => getApiUrl());
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!urlInput.trim()) return;
    setTesting(true);
    setError(null);

    const ok = await testConnection(urlInput.trim());
    setTesting(false);

    if (ok) {
      setApiUrl(urlInput.trim());
      setConnected(true);
      setCurrentUrl(urlInput.trim());
      setUrlInput('');
      onConnect();
    } else {
      setError('Connection failed — check the URL and that the Apps Script is deployed as "Anyone".');
    }
  };

  const handleDisconnect = () => {
    clearApiUrl();
    setConnected(false);
    setCurrentUrl(null);
    setError(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
        {connected ? (
          <>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            <span style={{ color: 'var(--green)' }}>Connected</span>
            <span className="text-muted truncate" style={{ maxWidth: 300, fontSize: 11 }} title={currentUrl || ''}>
              {currentUrl}
            </span>
            <button className="btn btn--ghost btn--sm" onClick={() => onConnect()}>
              Sync Now
            </button>
            <button className="btn btn--ghost btn--sm" onClick={handleDisconnect}>
              Disconnect
            </button>
          </>
        ) : (
          <>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />
            <span className="text-muted">Not connected (using local storage)</span>
            <input
              className="form-input"
              type="url"
              placeholder="Apps Script web app URL"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              style={{ minWidth: '16rem', fontSize: '0.8rem' }}
            />
            <button className="btn btn--accent btn--sm" onClick={handleConnect} disabled={testing || !urlInput.trim()}>
              {testing ? 'Testing...' : 'Connect'}
            </button>
          </>
        )}
      </div>
      {error && (
        <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>
      )}
    </div>
  );
}
