export type TaskStatus = 'todo' | 'in-progress' | 'code-review' | 'testing' | 'done' | 'released' | 'blocked';
export type Priority = 'high' | 'medium' | 'normal' | 'stretch';
export type Team = 'device' | 'software';
export type ViewMode = 'dashboard' | 'week' | 'standup' | 'kanban';

export interface Person {
  id: string;
  name: string;
  role: string;
  team: Team;
  initials: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  shortName: string;
  description: string;
  priority: Priority;
  owners: string[]; // person IDs
  color: string;
  isDeviceOnly: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  jiraKey?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  weekId: string;
  estimatedHours?: number;
  blockedBy?: string;
  blockerNote?: string;
  isDeviceTask: boolean;
  tags?: string[];
  order: number;
}

export interface Week {
  id: string;
  number: number;
  label: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface Risk {
  id: string;
  weekId: string;
  projectId?: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'mitigated' | 'closed';
}

export interface ActionItem {
  id: string;
  weekId: string;
  projectId?: string;
  title: string;
  assigneeId?: string;
  completed: boolean;
}

export interface TrackerState {
  projects: Project[];
  people: Person[];
  weeks: Week[];
  tasks: Task[];
  risks: Risk[];
  actions: ActionItem[];
  meta: {
    lastUpdated: string;
    version: number;
  };
}

export interface FilterState {
  personIds: string[];
  projectIds: string[];
  statuses: TaskStatus[];
  priorities: Priority[];
  teams: Team[];
  searchQuery: string;
}

export type AdminTab = 'projects' | 'people' | 'weeks' | 'risks' | 'actions';

export interface StandupChange {
  id: string;
  type: 'update_task' | 'create_task' | 'add_risk' | 'add_action' | 'move_task';
  confidence: 'high' | 'medium' | 'low';
  description: string;
  accepted: boolean;
  taskUpdate?: { taskId: string; updates: Partial<Task> };
  newTask?: Omit<Task, 'id' | 'order'>;
  newRisk?: Omit<Risk, 'id'>;
  newAction?: Omit<ActionItem, 'id'>;
  moveTask?: { taskId: string; weekId?: string; status?: TaskStatus; assigneeId?: string };
}

export type UpdateSourceType = 'meeting-notes' | 'slack' | 'email' | 'calendar' | 'spreadsheet' | 'other';

export interface UpdateSource {
  id: string;
  type: UpdateSourceType;
  label: string;
  content: string;
  fileName?: string;
}

export interface DailyUpdate {
  id: string;
  date: string;
  weekId: string;
  sources: UpdateSource[];
  changes: StandupChange[];
  appliedAt?: string;
  summary?: string;
}
