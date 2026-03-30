import type { UpdateSource } from '../types';

interface SlackMessage {
  user?: string;
  text: string;
  ts: string;
}

interface SlackResponse {
  ok: boolean;
  messages?: SlackMessage[];
  error?: string;
}

export async function pullSlackMessages(
  token: string,
  channels: string[]  // channel IDs
): Promise<UpdateSource[]> {
  const sources: UpdateSource[] = [];
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

  for (const channelId of channels) {
    try {
      const response = await fetch(`/api/slack/conversations.history?channel=${channelId}&oldest=${oneDayAgo}&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data: SlackResponse = await response.json();
      if (!data.ok || !data.messages?.length) continue;

      const content = data.messages
        .reverse()
        .map((m) => `- ${m.text}`)
        .join('\n');

      sources.push({
        id: `source-slack-${Date.now()}-${channelId}`,
        type: 'slack',
        label: `Slack #${channelId}`,
        content,
      });
    } catch (err) {
      console.warn(`Failed to pull Slack channel ${channelId}:`, err);
    }
  }

  return sources;
}
