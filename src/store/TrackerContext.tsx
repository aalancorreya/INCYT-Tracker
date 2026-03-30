import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import type { TrackerState, FilterState } from '../types';
import { trackerReducer } from './reducer';
import type { TrackerAction } from './reducer';
import { loadFromStorage, saveToStorage, clearStorage, exportToJSON } from './persistence';
import { getSeedData } from '../data/seed';
import { getApiUrl, fetchRemoteState, saveRemoteState } from '../services/appScriptSync';

type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';

interface TrackerContextValue {
  state: TrackerState;
  dispatch: React.Dispatch<TrackerAction>;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  getCurrentWeek: () => string;
  selectedWeekId: string;
  setSelectedWeekId: (weekId: string) => void;
  exportJSON: () => void;
  importJSON: (data: TrackerState) => void;
  syncStatus: SyncStatus;
  syncNow: () => Promise<void>;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

const defaultFilters: FilterState = {
  personIds: [],
  projectIds: [],
  statuses: [],
  priorities: [],
  teams: [],
  searchQuery: '',
};

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const initialState = loadFromStorage() || getSeedData();
  const [state, dispatch] = useReducer(trackerReducer, initialState);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    getApiUrl() ? 'syncing' : 'local'
  );

  // On mount, try to load from remote API
  useEffect(() => {
    const loadRemote = async () => {
      if (!getApiUrl()) return;
      setSyncStatus('syncing');
      const remote = await fetchRemoteState();
      if (remote) {
        dispatch({ type: 'IMPORT_STATE', payload: remote });
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    };
    loadRemote();
  }, []);

  // Debounced save to localStorage (and remote if connected)
  const saveTimeout = useRef<number>();
  useEffect(() => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      saveToStorage(state);
      if (getApiUrl()) {
        saveRemoteState(state).then((ok) => {
          setSyncStatus(ok ? 'synced' : 'error');
        });
      }
    }, 500);
    return () => clearTimeout(saveTimeout.current);
  }, [state]);

  const getCurrentWeek = useCallback(() => {
    const today = new Date();
    const week = state.weeks.find((w) => {
      const start = new Date(w.startDate);
      const end = new Date(w.endDate);
      end.setHours(23, 59, 59);
      return today >= start && today <= end;
    });
    return week?.id || 'w2';
  }, [state.weeks]);

  // Selected week for TopBar week selector
  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => {
    const today = new Date();
    const seedWeeks = (loadFromStorage() || getSeedData()).weeks;
    const week = seedWeeks.find((w) => {
      const start = new Date(w.startDate);
      const end = new Date(w.endDate);
      end.setHours(23, 59, 59);
      return today >= start && today <= end;
    });
    return week?.id || 'w2';
  });

  // Handle RESET_TO_SEED by clearing storage and reimporting seed
  const wrappedDispatch = useCallback(
    (action: TrackerAction) => {
      if (action.type === 'RESET_TO_SEED') {
        clearStorage();
        dispatch({ type: 'IMPORT_STATE', payload: getSeedData() });
      } else {
        dispatch(action);
      }
    },
    [dispatch]
  );

  const exportJSON = useCallback(() => {
    exportToJSON(state);
  }, [state]);

  const importJSON = useCallback((data: TrackerState) => {
    wrappedDispatch({ type: 'IMPORT_STATE', payload: data });
  }, [wrappedDispatch]);

  const syncNow = useCallback(async () => {
    if (!getApiUrl()) return;
    setSyncStatus('syncing');
    const remote = await fetchRemoteState();
    if (remote) {
      dispatch({ type: 'IMPORT_STATE', payload: remote });
      setSyncStatus('synced');
    } else {
      setSyncStatus('error');
    }
  }, []);

  return (
    <TrackerContext.Provider
      value={{
        state,
        dispatch: wrappedDispatch,
        filters,
        setFilters,
        getCurrentWeek,
        selectedWeekId,
        setSelectedWeekId,
        exportJSON,
        importJSON,
        syncStatus,
        syncNow,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider');
  return ctx;
}
