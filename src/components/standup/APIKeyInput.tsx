import { useState } from 'react';
import { getAPIKey, setAPIKey, clearAPIKey } from '../../store/persistence';

interface APIKeyInputProps {
  onKeySet: () => void;
}

export function APIKeyInput({ onKeySet }: APIKeyInputProps) {
  const existingKey = getAPIKey();
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(!!existingKey);

  const handleSave = () => {
    if (key.trim()) {
      setAPIKey(key.trim());
      setHasKey(true);
      setKey('');
      onKeySet();
    }
  };

  const handleClear = () => {
    clearAPIKey();
    setHasKey(false);
  };

  if (hasKey) {
    return (
      <div className="api-key-section">
        <span className="text-sm text-dim">API Key: ••••••••{existingKey?.slice(-8)}</span>
        <button className="btn btn--ghost btn--sm" onClick={handleClear}>Clear</button>
      </div>
    );
  }

  return (
    <div className="api-key-section">
      <input
        className="form-input"
        type="password"
        placeholder="Enter Anthropic API key..."
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
      />
      <button className="btn btn--accent btn--sm" onClick={handleSave}>Save Key</button>
    </div>
  );
}
