import { useState } from 'react';
import { getApiUrl, setApiUrl, clearApiUrl } from '../../services/appScriptSync';

interface ApiConfigPanelProps {
  onConnect: () => void;
}

export function ApiConfigPanel({ onConnect }: ApiConfigPanelProps) {
  const [urlInput, setUrlInput] = useState('');
  const [connected, setConnected] = useState(() => !!getApiUrl());
  const [currentUrl, setCurrentUrl] = useState(() => getApiUrl());

  const handleConnect = () => {
    if (!urlInput.trim()) return;
    setApiUrl(urlInput);
    setConnected(true);
    setCurrentUrl(urlInput.trim());
    setUrlInput('');
    onConnect();
  };

  const handleDisconnect = () => {
    clearApiUrl();
    setConnected(false);
    setCurrentUrl(null);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
      {connected ? (
        <>
          <span style={{ color: 'var(--color-success, #22c55e)' }}>
            Connected to: {currentUrl}
          </span>
          <button className="btn btn--ghost" onClick={() => onConnect()}>
            Sync Now
          </button>
          <button className="btn btn--ghost" onClick={handleDisconnect}>
            Disconnect
          </button>
        </>
      ) : (
        <>
          <span style={{ color: 'var(--color-muted, #888)' }}>
            Not connected (using local storage)
          </span>
          <input
            className="form-input"
            type="url"
            placeholder="Apps Script web app URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            style={{ minWidth: '16rem', fontSize: '0.8rem' }}
          />
          <button className="btn btn--accent" onClick={handleConnect}>
            Connect
          </button>
        </>
      )}
    </div>
  );
}
