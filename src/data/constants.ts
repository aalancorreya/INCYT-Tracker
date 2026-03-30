import type { TaskStatus, Priority, Week } from '../types';

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  'todo': { label: 'To Do', color: '#8b8fa3', bg: 'rgba(139,143,163,0.1)' },
  'in-progress': { label: 'In Progress', color: '#6c8aff', bg: 'rgba(108,138,255,0.1)' },
  'code-review': { label: 'Code Review', color: '#f0b429', bg: 'rgba(240,180,41,0.08)' },
  'testing': { label: 'Testing', color: '#b388ff', bg: 'rgba(179,136,255,0.08)' },
  'done': { label: 'Done', color: '#3dd68c', bg: 'rgba(61,214,140,0.08)' },
  'released': { label: 'Released', color: '#5ae8a8', bg: 'rgba(61,214,140,0.15)' },
  'blocked': { label: 'Blocked', color: '#ef5350', bg: 'rgba(239,83,80,0.08)' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: string }> = {
  'high': { label: 'High', color: '#ef5350', bg: 'rgba(239,83,80,0.08)', icon: '!!!' },
  'medium': { label: 'Medium', color: '#f0b429', bg: 'rgba(240,180,41,0.08)', icon: '!!' },
  'normal': { label: 'Normal', color: '#8b8fa3', bg: 'rgba(139,143,163,0.08)', icon: '!' },
  'stretch': { label: 'Stretch', color: '#6c8aff', bg: 'rgba(108,138,255,0.08)', icon: '~' },
};

export const WEEKS: Week[] = [
  {
    id: 'w1',
    number: 1,
    label: 'W1',
    startDate: '2026-03-24',
    endDate: '2026-03-28',
    note: 'Sprint start',
  },
  {
    id: 'w2',
    number: 2,
    label: 'W2',
    startDate: '2026-03-31',
    endDate: '2026-04-04',
    note: 'Current week',
  },
  {
    id: 'w3',
    number: 3,
    label: 'W3',
    startDate: '2026-04-07',
    endDate: '2026-04-11',
  },
  {
    id: 'w4',
    number: 4,
    label: 'W4',
    startDate: '2026-04-14',
    endDate: '2026-04-18',
    note: 'Easter week, 4-day week',
  },
  {
    id: 'w5',
    number: 5,
    label: 'W5',
    startDate: '2026-04-21',
    endDate: '2026-04-25',
  },
  {
    id: 'w6',
    number: 6,
    label: 'W6',
    startDate: '2026-04-28',
    endDate: '2026-05-01',
  },
  {
    id: 'w7',
    number: 7,
    label: 'W7',
    startDate: '2026-05-04',
    endDate: '2026-05-08',
  },
  {
    id: 'w8',
    number: 8,
    label: 'W8',
    startDate: '2026-05-11',
    endDate: '2026-05-15',
  },
  {
    id: 'w9',
    number: 9,
    label: 'W9',
    startDate: '2026-05-18',
    endDate: '2026-05-22',
  },
  {
    id: 'w10',
    number: 10,
    label: 'W10',
    startDate: '2026-05-25',
    endDate: '2026-06-06',
    note: 'Final sprint',
  },
];

export const CURRENT_WEEK_ID = 'w2';
