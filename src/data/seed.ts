import type { Person, Project, Task, Risk, ActionItem, TrackerState } from '../types';
import { WEEKS } from './constants';

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

const people: Person[] = [
  // Device team
  { id: 'simon-b', name: 'Simon Barnacoat', role: 'Device Engineering PM', team: 'device', initials: 'SB', color: '#4a9eff' },
  { id: 'chris-h', name: 'Chris Hook', role: 'Firmware Engineer', team: 'device', initials: 'CH', color: '#ef5350' },
  { id: 'keith-b', name: 'Keith Bates', role: 'Hardware Engineer', team: 'device', initials: 'KB', color: '#3dd68c' },
  { id: 'chathuni', name: 'Chathuni', role: 'Firmware Engineer', team: 'device', initials: 'CT', color: '#b388ff' },
  { id: 'jonathan', name: 'Jonathan', role: 'HK Contractor', team: 'device', initials: 'JN', color: '#f0b429' },
  { id: 'leon-o', name: 'Leon Ortega', role: 'Testing / Intern', team: 'device', initials: 'LO', color: '#4dd0e1' },
  { id: 'bradley-m', name: 'Bradley Mathew', role: 'Industrial Designer', team: 'device', initials: 'BM', color: '#ff7043' },
  { id: 'jonah-b', name: 'Jonah Beard', role: 'Industrial Designer', team: 'device', initials: 'JB', color: '#9ccc65' },
  { id: 'james-b', name: 'James Brennan', role: 'Senior Industrial Designer', team: 'device', initials: 'JB2', color: '#7986cb' },

  // Software team
  { id: 'andrea', name: 'Andrea', role: 'SW Team Lead', team: 'software', initials: 'AO', color: '#ce93d8' },
  { id: 'caleb-v', name: 'Caleb Vear', role: 'Backend Lead', team: 'software', initials: 'CV', color: '#f0b429' },
  { id: 'braveen-m', name: 'Braveen Murugathas', role: 'Software Engineer', team: 'software', initials: 'BrM', color: '#80deea' },
  { id: 'dev-k', name: 'Dev Khadka', role: 'Mobile Developer', team: 'software', initials: 'DK', color: '#a5d6a7' },
  { id: 'jerameel', name: 'Jerameel Delos Reyes', role: 'Software Engineer', team: 'software', initials: 'JR', color: '#ffab91' },
  { id: 'ishak', name: 'Ishak Iboy', role: 'Mobile Developer', team: 'software', initials: 'II', color: '#90caf9' },
];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const projects: Project[] = [
  // Device projects
  {
    id: 'winch-control',
    name: 'Winch Control System',
    shortName: 'Winch',
    description: 'Custom winch/gate control PCB and firmware',
    priority: 'medium',
    owners: ['keith-b', 'chathuni'],
    color: '#b388ff',
    isDeviceOnly: false,
  },
  {
    id: 'bn-pump-control',
    name: 'BN Pump Control',
    shortName: 'Pump Ctrl',
    description: 'BlueNode pump start/stop controller hardware and firmware',
    priority: 'high',
    owners: ['chris-h', 'keith-b'],
    color: '#ef5350',
    isDeviceOnly: false,
  },
  {
    id: 'bn-fw-bugs',
    name: 'BN Firmware Bugs',
    shortName: 'BN FW Bugs',
    description: 'BlueNode firmware bug fixes and maintenance',
    priority: 'medium',
    owners: ['chris-h'],
    color: '#ff7043',
    isDeviceOnly: true,
  },
  {
    id: 'camera-v2',
    name: 'Camera V2',
    shortName: 'Camera V2',
    description: 'Next-generation camera module evaluation and design',
    priority: 'stretch',
    owners: ['jonathan', 'chris-h'],
    color: '#f0b429',
    isDeviceOnly: true,
  },
  {
    id: 'api-integrations',
    name: 'API Integrations',
    shortName: 'API Integ',
    description: 'Third-party API integrations (John Deere, etc.)',
    priority: 'high',
    owners: ['andrea'],
    color: '#4dd0e1',
    isDeviceOnly: false,
  },
  {
    id: 'wika-bt-temp',
    name: 'Wika BT Temp Probe',
    shortName: 'Wika BT',
    description: 'Bluetooth temperature probe integration',
    priority: 'normal',
    owners: ['simon-b'],
    color: '#9ccc65',
    isDeviceOnly: true,
  },
  {
    id: 'sentek-bt-soil',
    name: 'Sentek BT Soil Moisture',
    shortName: 'Sentek BT',
    description: 'Bluetooth soil moisture sensor integration',
    priority: 'normal',
    owners: ['simon-b'],
    color: '#80cbc4',
    isDeviceOnly: true,
  },
  {
    id: 'bn-ota',
    name: 'BN OTA Updates',
    shortName: 'BN OTA',
    description: 'Over-the-air firmware update capability for BlueNode',
    priority: 'stretch',
    owners: ['chris-h'],
    color: '#7986cb',
    isDeviceOnly: true,
  },

  // Software virtual projects
  {
    id: 'mission-control',
    name: 'Mission Control',
    shortName: 'Mission Ctrl',
    description: 'Mission Control dashboard features and enhancements',
    priority: 'medium',
    owners: ['caleb-v'],
    color: '#3dd68c',
    isDeviceOnly: false,
  },
  {
    id: 'maintenance-runtime',
    name: 'Maintenance & Runtime',
    shortName: 'Maint/Runtime',
    description: 'Runtime tracking, maintenance scheduling, and corrections',
    priority: 'high',
    owners: ['andrea'],
    color: '#6c8aff',
    isDeviceOnly: false,
  },
  {
    id: 'rain-aggregator',
    name: 'Rain Aggregator',
    shortName: 'Rain Agg',
    description: 'Rain gauge aggregation and display',
    priority: 'normal',
    owners: ['andrea'],
    color: '#66bb6a',
    isDeviceOnly: false,
  },
  {
    id: 'bluenode-sw',
    name: 'BlueNode (SW)',
    shortName: 'BN SW',
    description: 'BlueNode software-side features (instant reading, clear action)',
    priority: 'medium',
    owners: ['andrea', 'caleb-v'],
    color: '#ffb74d',
    isDeviceOnly: false,
  },
  {
    id: 'other-testing',
    name: 'Other / Testing',
    shortName: 'Other',
    description: 'Miscellaneous tasks, tech debt, and testing pipeline',
    priority: 'normal',
    owners: ['andrea'],
    color: '#8b8fa3',
    isDeviceOnly: false,
  },
];

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

let taskCounter = 0;
function tid(): string {
  taskCounter += 1;
  return `task-${taskCounter}`;
}

const tasks: Task[] = [
  // ---- Pump Control (W1-W2) ----
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-2060',
    title: '[Mobile] Engine Start Failed popup appears multiple times',
    status: 'released', priority: 'high', assigneeId: 'dev-k',
    weekId: 'w1', isDeviceTask: false, order: 1,
  },
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-2059',
    title: '[Mobile] Linked device incorrectly shows No device linked',
    status: 'released', priority: 'high', assigneeId: 'dev-k',
    weekId: 'w1', isDeviceTask: false, order: 2,
  },
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-2042',
    title: 'Engine Start Failed popup appears multiple times',
    status: 'released', priority: 'high', assigneeId: 'braveen-m',
    weekId: 'w1', isDeviceTask: false, order: 3,
  },
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-2041',
    title: 'Linked device incorrectly shows No device linked',
    status: 'code-review', priority: 'high', assigneeId: 'braveen-m',
    weekId: 'w1', isDeviceTask: false, blockedBy: 'caleb-v',
    blockerNote: 'Waiting on Caleb review', order: 4,
  },
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-2033',
    title: 'Backend: Support firmware upgrade command workflow',
    status: 'code-review', priority: 'high', assigneeId: 'jerameel',
    weekId: 'w1', isDeviceTask: false, blockedBy: 'caleb-v',
    blockerNote: 'Waiting on Caleb review', order: 5,
  },
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-2029',
    title: '[Mobile] Implement firmware upgrade button',
    status: 'in-progress', priority: 'high', assigneeId: 'dev-k',
    weekId: 'w2', isDeviceTask: false, order: 6,
  },
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-2027',
    title: 'Add VSD Support to Device Controller Service',
    status: 'in-progress', priority: 'high', assigneeId: 'caleb-v',
    weekId: 'w2', isDeviceTask: false, order: 7,
  },
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-1947',
    title: 'Pump Control Sessions Not Recorded When Device Goes Offline',
    status: 'code-review', priority: 'high', assigneeId: 'braveen-m',
    weekId: 'w1', isDeviceTask: false, blockedBy: 'caleb-v',
    blockerNote: 'Waiting on Caleb review', order: 8,
  },
  {
    id: tid(), projectId: 'bn-pump-control', jiraKey: 'IN-1939',
    title: 'Clutch Engagement Trigger Logic on Remote Start',
    status: 'code-review', priority: 'high', assigneeId: 'braveen-m',
    weekId: 'w1', isDeviceTask: false, blockedBy: 'caleb-v',
    blockerNote: 'Waiting on Caleb review', order: 9,
  },

  // ---- Winch (W2) ----
  {
    id: tid(), projectId: 'winch-control', jiraKey: 'IN-2085',
    title: 'Backend: Generate action failure notifications for winch/gate commands',
    status: 'todo', priority: 'medium',
    weekId: 'w2', isDeviceTask: false, order: 1,
  },
  {
    id: tid(), projectId: 'winch-control', jiraKey: 'IN-2037',
    title: 'Winch: Add action failure notifications for the user',
    status: 'todo', priority: 'medium',
    weekId: 'w2', isDeviceTask: false, order: 2,
  },

  // ---- Mission Control (W1-W2) ----
  {
    id: tid(), projectId: 'mission-control', jiraKey: 'IN-2028',
    title: '[Mobile] Enable Multi-Screen Rotation with Configurable Time Interval',
    status: 'released', priority: 'medium', assigneeId: 'dev-k',
    weekId: 'w1', isDeviceTask: false, order: 1,
  },
  {
    id: tid(), projectId: 'mission-control', jiraKey: 'IN-2026',
    title: 'Enable Multi-Screen Rotation with Configurable Time Interval for Mission',
    status: 'code-review', priority: 'medium', assigneeId: 'caleb-v',
    weekId: 'w1', isDeviceTask: false, blockedBy: 'caleb-v',
    blockerNote: 'Waiting on Caleb review', order: 2,
  },

  // ---- Maintenance & Runtime (W2) ----
  {
    id: tid(), projectId: 'maintenance-runtime', jiraKey: 'IN-2086',
    title: 'Polaris: Update Runtime widget to new unified runtime design',
    status: 'todo', priority: 'high',
    weekId: 'w2', isDeviceTask: false, order: 1,
  },
  {
    id: tid(), projectId: 'maintenance-runtime', jiraKey: 'IN-2074',
    title: 'Backend: Ensure runtime corrections applied correctly',
    status: 'todo', priority: 'high',
    weekId: 'w2', isDeviceTask: false, order: 2,
  },
  {
    id: tid(), projectId: 'maintenance-runtime', jiraKey: 'IN-2073',
    title: 'Backend: Support runtime correction for Polaris and Pump Control',
    status: 'todo', priority: 'high',
    weekId: 'w2', isDeviceTask: false, order: 3,
  },
  {
    id: tid(), projectId: 'maintenance-runtime', jiraKey: 'IN-2072',
    title: 'Senquip: Update Runtime widget display',
    status: 'in-progress', priority: 'high', assigneeId: 'braveen-m',
    weekId: 'w2', isDeviceTask: false, order: 4,
  },
  {
    id: tid(), projectId: 'maintenance-runtime', jiraKey: 'IN-2070',
    title: 'Polaris/Senquip: Allow runtime hours entry alignment',
    status: 'todo', priority: 'high',
    weekId: 'w2', isDeviceTask: false, order: 5,
  },

  // ---- API Integrations / John Deere (W1-W2) ----
  {
    id: tid(), projectId: 'api-integrations', jiraKey: 'IN-2068',
    title: 'Scope and plan John Deere integration',
    status: 'in-progress', priority: 'high', assigneeId: 'andrea',
    weekId: 'w1', isDeviceTask: false, order: 1,
  },

  // ---- BlueNode SW (W2) ----
  {
    id: tid(), projectId: 'bluenode-sw', jiraKey: 'IN-2090',
    title: 'BlueNode: Add Instant Reading support',
    status: 'todo', priority: 'medium',
    weekId: 'w2', isDeviceTask: false, order: 1,
  },
  {
    id: tid(), projectId: 'bluenode-sw', jiraKey: 'IN-2089',
    title: 'BlueNode: Add Clear Action support',
    status: 'todo', priority: 'medium',
    weekId: 'w2', isDeviceTask: false, order: 2,
  },

  // ---- Rain Aggregator (W2) ----
  {
    id: tid(), projectId: 'rain-aggregator', jiraKey: 'IN-2091',
    title: 'Promote Rain Aggregator to Stable Apps',
    status: 'todo', priority: 'normal',
    weekId: 'w2', isDeviceTask: false, order: 1,
  },
  {
    id: tid(), projectId: 'rain-aggregator', jiraKey: 'IN-2005',
    title: 'Rain Aggregator (parent)',
    status: 'todo', priority: 'normal',
    weekId: 'w2', isDeviceTask: false, order: 2,
  },
  {
    id: tid(), projectId: 'rain-aggregator', jiraKey: 'IN-2051',
    title: 'Accumulated rainfall not displaying correctly',
    status: 'todo', priority: 'normal',
    weekId: 'w2', isDeviceTask: false, order: 3,
  },

  // ---- Other / Testing (W1-W2) ----
  {
    id: tid(), projectId: 'other-testing', jiraKey: 'IN-1988',
    title: 'Back End Support m4a and mp3 file for audio record',
    status: 'code-review', priority: 'normal',
    weekId: 'w1', isDeviceTask: false, blockedBy: 'caleb-v',
    blockerNote: 'Waiting on Caleb review', order: 1,
  },
  {
    id: tid(), projectId: 'other-testing', jiraKey: 'IN-1972',
    title: 'Data Smoothing for Fuel Level Monitoring',
    status: 'testing', priority: 'normal',
    weekId: 'w1', isDeviceTask: false, order: 2,
  },
  {
    id: tid(), projectId: 'other-testing', jiraKey: 'IN-1923',
    title: 'Validate Retrofit Kit Behaviour',
    status: 'testing', priority: 'normal',
    weekId: 'w1', isDeviceTask: false, order: 3,
  },
  {
    id: tid(), projectId: 'other-testing', jiraKey: 'IN-1912',
    title: 'Mobile app: Remove v1 code paths',
    status: 'testing', priority: 'normal', assigneeId: 'dev-k',
    weekId: 'w1', isDeviceTask: false, order: 4,
  },
  {
    id: tid(), projectId: 'other-testing', jiraKey: 'IN-1838',
    title: 'Android build update (16KB memory pages)',
    status: 'testing', priority: 'normal', assigneeId: 'ishak',
    weekId: 'w1', isDeviceTask: false, order: 5,
  },

  // ---- Device-only tasks (no Jira key) ----
  {
    id: tid(), projectId: 'bn-pump-control',
    title: 'BN Pump Control V1 — D flip-flop + contactor design, ~$50 BOM',
    status: 'in-progress', priority: 'high', assigneeId: 'chris-h',
    weekId: 'w1', isDeviceTask: true, order: 10,
  },
  {
    id: tid(), projectId: 'bn-pump-control',
    title: 'BN Pump Control — PCB schematic review',
    status: 'in-progress', priority: 'high', assigneeId: 'keith-b',
    weekId: 'w1', isDeviceTask: true, order: 11,
  },
  {
    id: tid(), projectId: 'bn-pump-control',
    title: 'BN Pump Control — Enclosure concept design',
    status: 'in-progress', priority: 'high', assigneeId: 'jonah-b',
    weekId: 'w2', isDeviceTask: true, order: 12,
  },
  {
    id: tid(), projectId: 'bn-fw-bugs',
    title: 'BN FW — GMT timestamp fix',
    status: 'in-progress', priority: 'medium', assigneeId: 'chris-h',
    weekId: 'w1', isDeviceTask: true, order: 1,
  },
  {
    id: tid(), projectId: 'bn-fw-bugs',
    title: 'BN FW — On-demand sample request',
    status: 'in-progress', priority: 'medium', assigneeId: 'chris-h',
    weekId: 'w2', isDeviceTask: true, order: 2,
  },
  {
    id: tid(), projectId: 'winch-control',
    title: 'Winch Control — PCBs sent for fab',
    status: 'in-progress', priority: 'medium', assigneeId: 'keith-b',
    weekId: 'w1', isDeviceTask: true, order: 3,
  },
  {
    id: tid(), projectId: 'winch-control',
    title: 'Winch Control — FW validation (board to Chathuni)',
    status: 'todo', priority: 'medium', assigneeId: 'chathuni',
    weekId: 'w2', isDeviceTask: true, order: 4,
  },
  {
    id: tid(), projectId: 'camera-v2',
    title: 'Camera V2 — Vendor shortlist evaluation',
    status: 'in-progress', priority: 'stretch', assigneeId: 'jonathan',
    weekId: 'w1', isDeviceTask: true, order: 1,
  },
  {
    id: tid(), projectId: 'wika-bt-temp',
    title: 'Wika BT Temp — Integration planning',
    status: 'todo', priority: 'normal',
    weekId: 'w3', isDeviceTask: true, order: 1,
  },
  {
    id: tid(), projectId: 'sentek-bt-soil',
    title: 'Sentek BT Soil — Integration planning',
    status: 'todo', priority: 'normal',
    weekId: 'w3', isDeviceTask: true, order: 1,
  },
  {
    id: tid(), projectId: 'bn-ota',
    title: 'BN OTA — PoC over LoRa (if Chris has capacity)',
    status: 'todo', priority: 'stretch', assigneeId: 'chris-h',
    weekId: 'w4', isDeviceTask: true, order: 1,
  },
];

// ---------------------------------------------------------------------------
// Risks
// ---------------------------------------------------------------------------

const risks: Risk[] = [
  {
    id: 'risk-1',
    weekId: 'w2',
    projectId: 'bn-pump-control',
    title: 'Caleb code review bottleneck',
    description: '6 tickets blocked across Pump Control, Mission Control, and Other — all waiting on Caleb review',
    severity: 'high',
    status: 'open',
  },
  {
    id: 'risk-2',
    weekId: 'w2',
    title: 'Chris Hook tracking blind spot',
    description: '4 projects (Pump HW, BN FW, Winch, Camera V2), no Jira trail, LXDH pull risk',
    severity: 'high',
    status: 'open',
  },
  {
    id: 'risk-3',
    weekId: 'w3',
    title: 'Easter capacity',
    description: 'W3-W4 are 4-day weeks, reduced capacity across both teams',
    severity: 'medium',
    status: 'open',
  },
  {
    id: 'risk-4',
    weekId: 'w1',
    projectId: 'camera-v2',
    title: 'Camera V2 vendor gap',
    description: 'No suitable device confirmed yet from vendor evaluation',
    severity: 'medium',
    status: 'open',
  },
  {
    id: 'risk-5',
    weekId: 'w2',
    title: 'Keith and Bradley capacity',
    description: 'Keith at ~12h capacity in W2, Bradley ~18h in W4',
    severity: 'medium',
    status: 'open',
  },
  {
    id: 'risk-6',
    weekId: 'w1',
    title: 'Device team Jira gap',
    description: 'DEN project dormant, progress only visible via standups — no written trail',
    severity: 'low',
    status: 'open',
  },
];

// ---------------------------------------------------------------------------
// Action Items
// ---------------------------------------------------------------------------

const actions: ActionItem[] = [
  {
    id: 'action-1',
    weekId: 'w2',
    projectId: 'bn-pump-control',
    title: 'Push Caleb for batch review clearance this week',
    assigneeId: 'andrea',
    completed: false,
  },
  {
    id: 'action-2',
    weekId: 'w2',
    title: 'Confirm Chris Hook standup attendance, request written updates',
    assigneeId: 'simon-b',
    completed: false,
  },
  {
    id: 'action-3',
    weekId: 'w2',
    projectId: 'bluenode-sw',
    title: 'Schedule BlueNode planning session',
    assigneeId: 'andrea',
    completed: false,
  },
  {
    id: 'action-4',
    weekId: 'w2',
    title: 'Plan Easter week capacity (4-day weeks W3-W4)',
    completed: false,
  },
  {
    id: 'action-5',
    weekId: 'w2',
    projectId: 'other-testing',
    title: 'Close out testing pipeline (IN-1972, 1923, 1912, 1838)',
    assigneeId: 'andrea',
    completed: false,
  },
];

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export function getSeedData(): TrackerState {
  return {
    projects,
    people,
    weeks: WEEKS,
    tasks,
    risks,
    actions,
    meta: {
      lastUpdated: '2026-03-30T00:00:00.000Z',
      version: 1,
    },
  };
}
