import type { TrackerState, StandupChange, TaskStatus } from '../types';

export async function processStandupNotes(
  notes: string,
  state: TrackerState,
  weekId: string,
  apiKey: string
): Promise<StandupChange[]> {
  const people = state.people.map((p) => ({ id: p.id, name: p.name, initials: p.initials }));
  const projects = state.projects.map((p) => ({ id: p.id, name: p.name, shortName: p.shortName }));
  const weekTasks = state.tasks
    .filter((t) => t.weekId === weekId)
    .map((t) => ({
      id: t.id,
      title: t.title,
      jiraKey: t.jiraKey,
      status: t.status,
      assigneeId: t.assigneeId,
      projectId: t.projectId,
    }));

  const systemPrompt = `You are an assistant that processes meeting/standup notes and extracts actionable updates for a project tracker.

You will be given the current state of tasks and people, plus freeform meeting notes. Extract changes as a JSON array.

Each change object must have:
- type: "update_task" | "create_task" | "add_risk" | "add_action" | "move_task"
- confidence: "high" | "medium" | "low"
- description: human-readable summary of the change

Plus ONE of these payload fields depending on type:
- For "update_task": { "taskUpdate": { "taskId": "<existing task id>", "updates": { "status": "...", "blockerNote": "...", etc } } }
- For "create_task": { "newTask": { "projectId": "...", "title": "...", "status": "todo", "priority": "normal", "assigneeId": "...", "weekId": "${weekId}", "isDeviceTask": false } }
- For "add_risk": { "newRisk": { "weekId": "${weekId}", "title": "...", "description": "...", "severity": "high|medium|low", "status": "open" } }
- For "add_action": { "newAction": { "weekId": "${weekId}", "title": "...", "assigneeId": "...", "completed": false } }
- For "move_task": { "moveTask": { "taskId": "...", "status": "...", "assigneeId": "..." } }

Valid statuses: todo, in-progress, code-review, testing, done, released, blocked
Valid priorities: high, medium, normal, stretch

Match people by name (first name, last name, or initials). Match tasks by title keywords or Jira key. If a match is ambiguous, use confidence "low".

Respond with ONLY a JSON array, no markdown, no explanation.`;

  const userMessage = `## Current People
${JSON.stringify(people, null, 2)}

## Current Projects
${JSON.stringify(projects, null, 2)}

## Current Tasks (Week ${weekId})
${JSON.stringify(weekTasks, null, 2)}

## Meeting Notes
${notes}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '[]';

  // Parse JSON, handling potential markdown wrapping
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const changes: StandupChange[] = JSON.parse(jsonStr);

  // Add IDs and default accepted state
  return changes.map((change, i) => ({
    ...change,
    id: `change-${Date.now()}-${i}`,
    accepted: true,
  }));
}
