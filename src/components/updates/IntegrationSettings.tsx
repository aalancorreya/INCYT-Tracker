import { useState } from 'react';
import { Modal } from '../shared/Modal';

interface IntegrationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

// localStorage keys
const SLACK_TOKEN_KEY = 'incyt-slack-token';
const SLACK_CHANNELS_KEY = 'incyt-slack-channels';
const JIRA_EMAIL_KEY = 'incyt-jira-email';
const JIRA_TOKEN_KEY = 'incyt-jira-token';
const JIRA_DOMAIN_KEY = 'incyt-jira-domain';

export function getSlackToken(): string | null {
  return localStorage.getItem(SLACK_TOKEN_KEY);
}

export function getSlackChannels(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SLACK_CHANNELS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getJiraCredentials(): { email: string; token: string; domain: string } | null {
  const email = localStorage.getItem(JIRA_EMAIL_KEY);
  const token = localStorage.getItem(JIRA_TOKEN_KEY);
  const domain = localStorage.getItem(JIRA_DOMAIN_KEY);
  if (!email || !token || !domain) return null;
  return { email, token, domain };
}

export function IntegrationSettings({ isOpen, onClose }: IntegrationSettingsProps) {
  // Slack state
  const [slackToken, setSlackToken] = useState(localStorage.getItem(SLACK_TOKEN_KEY) || '');
  const [slackChannels, setSlackChannels] = useState(
    (() => {
      try {
        return (JSON.parse(localStorage.getItem(SLACK_CHANNELS_KEY) || '[]') as string[]).join(', ');
      } catch {
        return '';
      }
    })()
  );
  const [slackSaved, setSlackSaved] = useState(!!localStorage.getItem(SLACK_TOKEN_KEY));

  // Jira state
  const [jiraDomain, setJiraDomain] = useState(localStorage.getItem(JIRA_DOMAIN_KEY) || '');
  const [jiraEmail, setJiraEmail] = useState(localStorage.getItem(JIRA_EMAIL_KEY) || '');
  const [jiraToken, setJiraToken] = useState(localStorage.getItem(JIRA_TOKEN_KEY) || '');
  const [jiraSaved, setJiraSaved] = useState(!!localStorage.getItem(JIRA_TOKEN_KEY));

  function handleSaveSlack() {
    localStorage.setItem(SLACK_TOKEN_KEY, slackToken.trim());
    const channels = slackChannels
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    localStorage.setItem(SLACK_CHANNELS_KEY, JSON.stringify(channels));
    setSlackSaved(true);
  }

  function handleClearSlack() {
    localStorage.removeItem(SLACK_TOKEN_KEY);
    localStorage.removeItem(SLACK_CHANNELS_KEY);
    setSlackToken('');
    setSlackChannels('');
    setSlackSaved(false);
  }

  function handleSaveJira() {
    localStorage.setItem(JIRA_DOMAIN_KEY, jiraDomain.trim());
    localStorage.setItem(JIRA_EMAIL_KEY, jiraEmail.trim());
    localStorage.setItem(JIRA_TOKEN_KEY, jiraToken.trim());
    setJiraSaved(true);
  }

  function handleClearJira() {
    localStorage.removeItem(JIRA_DOMAIN_KEY);
    localStorage.removeItem(JIRA_EMAIL_KEY);
    localStorage.removeItem(JIRA_TOKEN_KEY);
    setJiraDomain('');
    setJiraEmail('');
    setJiraToken('');
    setJiraSaved(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Integration Settings" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Slack Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Slack</h3>
            {slackSaved ? (
              <span style={{ color: '#22c55e', fontSize: '0.85rem' }}>&#10003; Configured</span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Not configured</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Bot Token
              <input
                type="password"
                value={slackToken}
                onChange={(e) => setSlackToken(e.target.value)}
                placeholder="xoxb-..."
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </label>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Channel IDs (comma-separated)
              <input
                type="text"
                value={slackChannels}
                onChange={(e) => setSlackChannels(e.target.value)}
                placeholder="C01ABC123, C02DEF456"
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                onClick={handleSaveSlack}
                disabled={!slackToken.trim()}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#3b82f6',
                  color: '#fff',
                  cursor: slackToken.trim() ? 'pointer' : 'not-allowed',
                  opacity: slackToken.trim() ? 1 : 0.5,
                  fontSize: '0.85rem',
                }}
              >
                Save
              </button>
              {slackSaved && (
                <button
                  onClick={handleClearSlack}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: 0 }} />

        {/* Jira Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Jira</h3>
            {jiraSaved ? (
              <span style={{ color: '#22c55e', fontSize: '0.85rem' }}>&#10003; Configured</span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Not configured</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Domain
              <input
                type="text"
                value={jiraDomain}
                onChange={(e) => setJiraDomain(e.target.value)}
                placeholder="mycompany.atlassian.net"
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </label>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Email
              <input
                type="email"
                value={jiraEmail}
                onChange={(e) => setJiraEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </label>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              API Token
              <input
                type="password"
                value={jiraToken}
                onChange={(e) => setJiraToken(e.target.value)}
                placeholder="Your Jira API token"
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                onClick={handleSaveJira}
                disabled={!jiraDomain.trim() || !jiraEmail.trim() || !jiraToken.trim()}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#3b82f6',
                  color: '#fff',
                  cursor: jiraDomain.trim() && jiraEmail.trim() && jiraToken.trim() ? 'pointer' : 'not-allowed',
                  opacity: jiraDomain.trim() && jiraEmail.trim() && jiraToken.trim() ? 1 : 0.5,
                  fontSize: '0.85rem',
                }}
              >
                Save
              </button>
              {jiraSaved && (
                <button
                  onClick={handleClearJira}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
