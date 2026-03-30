import type { TrackerState, Task, Risk, ActionItem, TaskStatus, Project, Person, Week } from '../types';

export type TrackerAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; weekId?: string; status?: TaskStatus; assigneeId?: string; projectId?: string } }
  | { type: 'REORDER_TASKS'; payload: { taskIds: string[]; status: TaskStatus; weekId: string } }
  | { type: 'ADD_RISK'; payload: Risk }
  | { type: 'UPDATE_RISK'; payload: { id: string; updates: Partial<Risk> } }
  | { type: 'DELETE_RISK'; payload: string }
  | { type: 'ADD_ACTION'; payload: ActionItem }
  | { type: 'TOGGLE_ACTION'; payload: string }
  | { type: 'DELETE_ACTION'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: { id: string; updates: Partial<Person> } }
  | { type: 'DELETE_PERSON'; payload: string }
  | { type: 'ADD_WEEK'; payload: Week }
  | { type: 'UPDATE_WEEK'; payload: { id: string; updates: Partial<Week> } }
  | { type: 'DELETE_WEEK'; payload: string }
  | { type: 'UPDATE_ACTION'; payload: { id: string; updates: Partial<ActionItem> } }
  | { type: 'IMPORT_STATE'; payload: TrackerState }
  | { type: 'RESET_TO_SEED' };

function withTimestamp(state: TrackerState): TrackerState {
  return {
    ...state,
    meta: {
      ...state.meta,
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function trackerReducer(state: TrackerState, action: TrackerAction): TrackerState {
  switch (action.type) {
    case 'ADD_TASK':
      return withTimestamp({
        ...state,
        tasks: [...state.tasks, action.payload],
      });

    case 'UPDATE_TASK':
      return withTimestamp({
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      });

    case 'DELETE_TASK':
      return withTimestamp({
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      });

    case 'MOVE_TASK': {
      const { taskId, weekId, status, assigneeId, projectId } = action.payload;
      return withTimestamp({
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            ...(weekId !== undefined && { weekId }),
            ...(status !== undefined && { status }),
            ...(assigneeId !== undefined && { assigneeId }),
            ...(projectId !== undefined && { projectId }),
          };
        }),
      });
    }

    case 'REORDER_TASKS': {
      const { taskIds, status, weekId } = action.payload;
      const orderMap = new Map(taskIds.map((id, index) => [id, index]));
      return withTimestamp({
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.status === status && t.weekId === weekId && orderMap.has(t.id)) {
            return { ...t, order: orderMap.get(t.id)! };
          }
          return t;
        }),
      });
    }

    case 'ADD_RISK':
      return withTimestamp({
        ...state,
        risks: [...state.risks, action.payload],
      });

    case 'UPDATE_RISK':
      return withTimestamp({
        ...state,
        risks: state.risks.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      });

    case 'DELETE_RISK':
      return withTimestamp({
        ...state,
        risks: state.risks.filter((r) => r.id !== action.payload),
      });

    case 'ADD_ACTION':
      return withTimestamp({
        ...state,
        actions: [...state.actions, action.payload],
      });

    case 'TOGGLE_ACTION':
      return withTimestamp({
        ...state,
        actions: state.actions.map((a) =>
          a.id === action.payload ? { ...a, completed: !a.completed } : a
        ),
      });

    case 'DELETE_ACTION':
      return withTimestamp({
        ...state,
        actions: state.actions.filter((a) => a.id !== action.payload),
      });

    case 'ADD_PROJECT':
      return withTimestamp({
        ...state,
        projects: [...state.projects, action.payload],
      });

    case 'UPDATE_PROJECT':
      return withTimestamp({
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      });

    case 'DELETE_PROJECT':
      return withTimestamp({
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        tasks: state.tasks.filter((t) => t.projectId !== action.payload),
      });

    case 'ADD_PERSON':
      return withTimestamp({
        ...state,
        people: [...state.people, action.payload],
      });

    case 'UPDATE_PERSON':
      return withTimestamp({
        ...state,
        people: state.people.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      });

    case 'DELETE_PERSON':
      return withTimestamp({
        ...state,
        people: state.people.filter((p) => p.id !== action.payload),
        tasks: state.tasks.map((t) =>
          t.assigneeId === action.payload ? { ...t, assigneeId: undefined } : t
        ),
      });

    case 'ADD_WEEK':
      return withTimestamp({
        ...state,
        weeks: [...state.weeks, action.payload],
      });

    case 'UPDATE_WEEK':
      return withTimestamp({
        ...state,
        weeks: state.weeks.map((w) =>
          w.id === action.payload.id ? { ...w, ...action.payload.updates } : w
        ),
      });

    case 'DELETE_WEEK':
      return withTimestamp({
        ...state,
        weeks: state.weeks.filter((w) => w.id !== action.payload),
        tasks: state.tasks.filter((t) => t.weekId !== action.payload),
      });

    case 'UPDATE_ACTION':
      return withTimestamp({
        ...state,
        actions: state.actions.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.updates } : a
        ),
      });

    case 'IMPORT_STATE':
      return withTimestamp(action.payload);

    case 'RESET_TO_SEED':
      // Caller should pass seed data via IMPORT_STATE instead.
      // This is a no-op fallback; the context provider handles the actual reset.
      return withTimestamp({
        ...state,
        meta: { ...state.meta, version: state.meta.version + 1 },
      });

    default:
      return state;
  }
}
