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

/**
 * Fetches tracker state from the Apps Script web app.
 * Apps Script redirects GET requests — fetch follows redirects by default.
 * The response is { success: true, data: TrackerState } or { success: false, error: string }.
 */
export async function fetchRemoteState(url?: string): Promise<TrackerState | null> {
  const apiUrl = url || getApiUrl();
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}?action=getState`, {
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();

    // Apps Script wraps the state in { success, data }
    if (json.success && json.data) {
      return json.data as TrackerState;
    }
    // If the response IS the state directly (has projects/tasks arrays)
    if (json.projects || json.tasks) {
      return json as TrackerState;
    }
    if (json.error) throw new Error(json.error);
    return null;
  } catch (err) {
    console.warn('Failed to fetch remote state:', err);
    return null;
  }
}

/**
 * Saves tracker state to the Apps Script web app.
 * Apps Script POST requests also redirect — we need to handle this.
 * Using 'text/plain' content type avoids CORS preflight.
 */
export async function saveRemoteState(state: TrackerState): Promise<boolean> {
  const url = getApiUrl();
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'saveState', payload: state }),
      redirect: 'follow',
    });
    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.warn('Failed to save remote state:', err);
    return false;
  }
}

/**
 * Tests connectivity to an Apps Script URL.
 * Returns true if we can successfully fetch state.
 */
export async function testConnection(url: string): Promise<boolean> {
  try {
    const state = await fetchRemoteState(url);
    return state !== null;
  } catch {
    return false;
  }
}
