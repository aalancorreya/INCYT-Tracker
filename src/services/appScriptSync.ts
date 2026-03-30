import type { TrackerState } from '../types';

const API_URL_KEY = 'incyt-api-url';

export function getApiUrl(): string | null {
  return localStorage.getItem(API_URL_KEY);
}

export function setApiUrl(url: string): void {
  localStorage.setItem(API_URL_KEY, url.trim());
}

export function clearApiUrl(): void {
  localStorage.removeItem(API_URL_KEY);
}

export async function fetchRemoteState(): Promise<TrackerState | null> {
  const url = getApiUrl();
  if (!url) return null;

  try {
    const response = await fetch(`${url}?action=getState`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data as TrackerState;
  } catch (err) {
    console.warn('Failed to fetch remote state:', err);
    return null;
  }
}

export async function saveRemoteState(state: TrackerState): Promise<boolean> {
  const url = getApiUrl();
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'saveState', payload: state }),
    });
    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.warn('Failed to save remote state:', err);
    return false;
  }
}
