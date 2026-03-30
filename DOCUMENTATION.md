# INCYT Program Tracker — Documentation

## Overview

A React-based R&D program tracker for INCYT's 10-week roadmap. Features a dashboard, week view, standup view, kanban board, daily update hub with AI processing, and a data admin panel. Data is persisted in Google Sheets via Apps Script and the frontend is hosted on GitHub Pages.

---

## Architecture

```
┌─────────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│  React App          │ fetch │  Google Apps Script   │ read/ │  Google Sheet    │
│  (GitHub Pages)     │──────▶│  (Web App)            │──────▶│  (Database)      │
└─────────────────────┘       └──────────────────────┘  write └──────────────────┘
```

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Routing**: React Router v7 (HashRouter)
- **State**: useReducer + Context (no Redux)
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **AI Processing**: Claude API via direct fetch (Sonnet model)
- **Persistence**: localStorage (offline) + Google Apps Script (shared)

### Backend
- **Google Apps Script**: Deployed as a Web App, provides REST-like API
- **Database**: Google Sheets — one tab per entity (Projects, People, Tasks, Weeks, Risks, Actions, Meta)

---

## URLs

| Resource | URL |
|----------|-----|
| **Live App** | https://aalancorreya.github.io/INCYT-Tracker/ |
| **GitHub Repo** | https://github.com/aalancorreya/INCYT-Tracker |
| **Google Sheet (DB)** | https://docs.google.com/spreadsheets/d/1lyBtzsD6bovh3U_lQi0nCLahRW0aC-Jtd-eflcbjL8Q |
| **Apps Script Web App** | https://script.google.com/macros/s/AKfycbxwrB1vUv4xXMoljmc--WF15pKpVYyPdnz-Tjzvaan3oGlBudFtzXg3KXuzy5Ij0wGM/exec |

---

## Local Development

### Prerequisites
- Node.js 20+
- Git

### Setup
```bash
cd C:/Users/Aalan/incyt-tracker-build
npm install
npm run dev
```

Dev server starts at `http://localhost:5173` (or next available port).

### Build
```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build locally
```

### Project Structure
```
src/
├── App.tsx                          # Routes (HashRouter)
├── main.tsx                         # Entry point
├── types.ts                         # All TypeScript interfaces
├── components/
│   ├── admin/                       # Data Admin CRUD tables
│   │   ├── AdminView.tsx            # Tab container
│   │   ├── ProjectsTable.tsx
│   │   ├── PeopleTable.tsx
│   │   ├── WeeksTable.tsx
│   │   ├── RisksTable.tsx
│   │   └── ActionsTable.tsx
│   ├── dashboard/                   # Dashboard view
│   │   ├── DashboardView.tsx
│   │   ├── ProjectHealthCard.tsx
│   │   ├── RiskSummary.tsx
│   │   └── TimelineBar.tsx
│   ├── kanban/                      # Kanban board with drag & drop
│   │   ├── KanbanView.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── KanbanCard.tsx
│   ├── layout/                      # App shell, sidebar, topbar
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── shared/                      # Reusable components
│   │   ├── AddTaskForm.tsx
│   │   ├── ApiConfigPanel.tsx       # Backend connection UI
│   │   ├── FilterBar.tsx
│   │   ├── InlineEdit.tsx
│   │   ├── Modal.tsx
│   │   ├── PersonAvatar.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── StatusPill.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskDetailModal.tsx
│   ├── standup/                     # Standup view + AI notes
│   │   ├── StandupView.tsx
│   │   ├── PersonCentricView.tsx
│   │   ├── ProjectCentricView.tsx
│   │   ├── AINotesPanel.tsx
│   │   └── APIKeyInput.tsx
│   ├── updates/                     # Daily Update Hub
│   │   ├── DailyUpdateView.tsx      # Main orchestrator
│   │   ├── SourceInputPanel.tsx     # Multi-source input
│   │   ├── ChangeReviewPanel.tsx    # AI change review
│   │   ├── UpdateHistory.tsx        # Past updates sidebar
│   │   ├── ImportChangesModal.tsx   # JSON import
│   │   └── IntegrationSettings.tsx  # Slack/Jira config
│   └── week/                        # Week view
│       ├── WeekView.tsx
│       ├── WeekTabs.tsx
│       ├── WorkstreamBlock.tsx
│       └── TicketRow.tsx
├── data/
│   ├── constants.ts                 # STATUS_CONFIG, PRIORITY_CONFIG, WEEKS
│   └── seed.ts                      # Initial seed data
├── services/
│   ├── aiProcessor.ts               # Claude API — standup notes
│   ├── dailyUpdateProcessor.ts      # Claude API — multi-source daily updates
│   ├── appScriptSync.ts             # Google Apps Script sync
│   ├── slackPull.ts                 # Slack channel message pull
│   └── jiraPull.ts                  # Jira issue pull
├── store/
│   ├── TrackerContext.tsx            # React Context + Provider
│   ├── reducer.ts                   # useReducer actions
│   ├── persistence.ts               # localStorage + export/import
│   └── updateHistory.ts             # Daily update history storage
└── styles/
    ├── variables.css                # CSS custom properties (dark theme)
    ├── global.css                   # Reset + base styles
    └── components.css               # All component styles
```

---

## Git & Deployment Procedures

### Credentials
- GitHub PATs are stored in: `G:/Shared drives/.../Product Management - ClaudeCodeSpace/.credentials/github-pats.md`
- **Classic PAT**: works for `aalancorreya` personal repos
- **Fine-grained PAT**: needed for `incyt` org repos (org policy blocks classic PATs)
- Regenerate at: https://github.com/settings/tokens

### Day-to-Day Workflow

#### Making changes and deploying
```bash
# 1. Work in the local build directory
cd C:/Users/Aalan/incyt-tracker-build

# 2. Start dev server
npm run dev

# 3. Make changes, verify in browser

# 4. Build to check for errors
npm run build

# 5. Commit
git add -A
git commit -m "Description of changes"

# 6. Push to GitHub (auto-deploys via GitHub Actions)
git push origin master:main

# 7. Sync to shared drive (backup)
cp -r src/ "g:/Shared drives/P1 Engineering/13 AI Automation/Aalan Sandbox/Product Management - ClaudeCodeSpace/incyt-tracker/src/"
```

#### If push fails with auth error
```bash
# Set URL with PAT (replace YOUR_PAT with actual token)
git remote set-url origin https://YOUR_PAT@github.com/aalancorreya/INCYT-Tracker.git
git push origin master:main

# Then remove PAT from URL for security
git remote set-url origin https://github.com/aalancorreya/INCYT-Tracker.git
```

#### If transferring repo to incyt org
1. Go to repo Settings > General > Danger Zone > Transfer ownership
2. Transfer to `incyt`
3. Update remote: `git remote set-url origin https://github.com/incyt/INCYT-Tracker.git`
4. Create a fine-grained PAT with resource owner = `incyt`, Contents = Read & write

### GitHub Actions (Auto-Deploy)
- Workflow: `.github/workflows/deploy.yml`
- Triggers on push to `main`
- Builds with Vite and deploys to GitHub Pages
- To check status: go to repo > Actions tab

---

## Google Apps Script Backend

### Setup (first time)
1. Open the Google Sheet
2. Extensions > Apps Script
3. Paste contents of `apps-script/Code.gs`
4. Select `setup` from function dropdown > Run
5. Authorize permissions when prompted
6. Deploy > New deployment > Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the web app URL

### Updating the Apps Script
1. Edit code in the Apps Script editor
2. Deploy > Manage deployments > Edit (pencil icon)
3. Version: **New version**
4. Click Deploy
5. The URL stays the same

### Sheet Tab Structure
| Tab | Columns |
|-----|---------|
| Projects | id, name, shortName, description, priority, owners (JSON), color, isDeviceOnly |
| People | id, name, role, team, initials, color |
| Weeks | id, number, label, startDate, endDate, note |
| Tasks | id, projectId, jiraKey, title, description, status, priority, assigneeId, weekId, estimatedHours, blockedBy, blockerNote, isDeviceTask, tags (JSON), order |
| Risks | id, weekId, projectId, title, description, severity, status |
| Actions | id, weekId, projectId, title, assigneeId, completed |
| Meta | key, value |

### API Endpoints
- **GET** `?action=getState` — returns full tracker state as JSON
- **POST** `{ action: "saveState", payload: TrackerState }` — full state rewrite
- **POST** `{ action: "updateTasks", payload: Task[] }` — tasks only

---

## Connecting the App to the Backend

1. Open the app and go to **Data Admin** (`/#/admin`)
2. Paste the Apps Script web app URL in the connection panel
3. Click **Connect** — tests the connection first, then syncs
4. TopBar shows sync status: Local / Syncing / Synced / Sync Error

Data flow:
- On page load: fetches state from Apps Script, merges into app
- On any change: debounced save (500ms) to both localStorage and Apps Script
- "Sync Now" button: force re-fetch from remote

---

## Features

### 1. Dashboard
Project health cards with progress bars, status breakdown, timeline, and risk summary.

### 2. Week View
Weekly sprint board organized by project/workstream with expandable task cards.

### 3. Standup View
Person-centric or project-centric views with task checklist for standup meetings. Includes AI Notes Processor.

### 4. Kanban Board
Drag-and-drop kanban with columns for each status. Supports cross-column moves and within-column reordering.

### 5. Daily Update Hub (`/#/updates`)
Multi-source input (meeting notes, Slack dumps, emails, etc.) → AI processes all sources → proposes changes → user reviews/accepts/rejects → apply. Stores update history.

### 6. Data Admin (`/#/admin`)
CRUD tables for Projects, People, Weeks, Risks, Actions. Backend connection panel.

### 7. Task Detail Modal
Click any task anywhere → modal with all editable fields → save/delete.

### 8. AI Processing
- **Standup Notes**: Paste meeting notes → Claude extracts task updates, new tasks, risks, actions
- **Daily Updates**: Multi-source with deduplication across sources
- Requires Anthropic API key (stored in browser localStorage)

### 9. External Integrations (via Vite dev proxy)
- **Slack**: Pull messages from configured channels
- **Jira**: Pull recently updated issues
- Configure tokens in Integration Settings modal

---

## Troubleshooting

### "Connection failed" when connecting to Apps Script
- Verify the URL ends with `/exec` (not `/dev`)
- Make sure the Apps Script is deployed as "Anyone" access
- Check the Apps Script logs: Apps Script editor > Executions

### Build fails with MISSING_EXPORT
- Vite 8/rolldown requires `import type` for type-only imports
- Fix: change `import { TypeName }` to `import type { TypeName }`

### Kanban drag not working
- PointerSensor requires 5px movement to activate (prevents click conflicts)
- DragOverlay uses a separate component (not the sortable card)

### Data not syncing
- Check TopBar sync indicator
- Open browser DevTools > Console for sync errors
- Verify Apps Script web app URL is correct in Data Admin
- Apps Script has ~6 second cold start on first request

### npm install fails on shared drive
- Google Shared Drive has filesystem limitations (TAR_ENTRY_ERROR)
- Always use local directory `C:/Users/Aalan/incyt-tracker-build/` for npm operations
- Sync files to shared drive after building
