import type { DailyUpdate } from '../types';

const STORAGE_KEY = 'incyt-daily-updates';
const MAX_AGE_DAYS = 30;

export function saveUpdate(update: DailyUpdate): void {
  try {
    const existing = loadUpdates();
    existing.push(update);

    // Trim entries older than 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MAX_AGE_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const trimmed = existing.filter((u) => u.date >= cutoffStr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save daily update:', e);
  }
}

export function loadUpdates(): DailyUpdate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DailyUpdate[];
  } catch (e) {
    console.error('Failed to load daily updates:', e);
    return [];
  }
}

export function deleteUpdate(id: string): void {
  try {
    const existing = loadUpdates();
    const filtered = existing.filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete daily update:', e);
  }
}
