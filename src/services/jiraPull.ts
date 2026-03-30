import type { UpdateSource } from '../types';

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    assignee?: { displayName: string } | null;
    updated: string;
  };
}

interface JiraSearchResponse {
  issues: JiraIssue[];
}

export async function pullJiraUpdates(
  email: string,
  apiToken: string,
  domain: string  // e.g., "mycompany.atlassian.net"
): Promise<UpdateSource | null> {
  try {
    const jql = encodeURIComponent('updated >= -1d ORDER BY updated DESC');
    const auth = btoa(`${email}:${apiToken}`);

    const response = await fetch(`/api/jira/${domain}/rest/api/3/search?jql=${jql}&maxResults=30&fields=summary,status,assignee,updated`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return null;
    const data: JiraSearchResponse = await response.json();
    if (!data.issues?.length) return null;

    const content = data.issues
      .map((issue) => {
        const assignee = issue.fields.assignee?.displayName || 'Unassigned';
        return `- ${issue.key}: ${issue.fields.summary} [${issue.fields.status.name}] (${assignee})`;
      })
      .join('\n');

    return {
      id: `source-jira-${Date.now()}`,
      type: 'other',
      label: 'Jira — Recently Updated',
      content,
    };
  } catch (err) {
    console.warn('Failed to pull Jira updates:', err);
    return null;
  }
}
