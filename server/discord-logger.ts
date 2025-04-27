
import { Log } from "@shared/schema";

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1365508833815953518/i6QoxKXSD75Yp-F1zmeVEga1K_DKt3J4xAOdMe_TGWXjWPmBkAbhCB9l4dyfoQtC7Yl8";

export async function sendDiscordLog(log: Log) {
  // Only log public information
  const embed = {
    title: "Channel Activity",
    description: log.event,
    color: getColorForStatus(log.status),
    fields: [
      {
        name: "Channel",
        value: log.channelName,
        inline: true
      },
      {
        name: "Status",
        value: log.status,
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error('Failed to send Discord webhook:', error);
  }
}

function getColorForStatus(status: string): number {
  switch (status) {
    case 'success': return 0x00FF00;
    case 'warning': return 0xFFFF00;
    case 'error': return 0xFF0000;
    default: return 0x7289DA;
  }
}
