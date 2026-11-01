export interface ChatBadge {
  type: string;
  version: string;
}

export interface ChatEmote {
  id: string;
  start: number;
  end: number;
  name: string;
}

export interface ChatMessage {
  id: string;
  channel: string;
  username: string;
  displayName: string;
  color: string;
  badges: ChatBadge[];
  emotes: ChatEmote[];
  text: string;
  isAction: boolean; // /me action
  timestamp: number;
}

// Default fallback colors matching Twitch palette
const DEFAULT_COLORS = [
  '#FF0000', '#0000FF', '#00FF00', '#B22222', '#FF7F50',
  '#9ACD32', '#FF4500', '#2E8B57', '#DAA520', '#D2691E',
  '#5F9EA0', '#1E90FF', '#FF69B4', '#8A2BE2', '#00FF7F'
];

export function getFallbackColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[index];
}

// Parse Twitch IRC raw tags
function parseTags(rawTags: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const pairs = rawTags.split(';');
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx !== -1) {
      const key = pair.slice(0, eqIdx);
      const val = pair.slice(eqIdx + 1)
        .replace(/\\s/g, ' ')
        .replace(/\\:/g, ';')
        .replace(/\\\\/g, '\\')
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n');
      tags[key] = val;
    }
  }
  return tags;
}

// Parse badges string: e.g. "broadcaster/1,subscriber/12"
function parseBadges(badgesStr?: string): ChatBadge[] {
  if (!badgesStr) return [];
  return badgesStr.split(',').map((badge) => {
    const [type, version] = badge.split('/');
    return { type, version: version || '1' };
  });
}

// Parse emotes string: e.g. "25:0-4,12-16/1902:6-10"
function parseEmotes(emotesStr?: string, messageText: string = ''): ChatEmote[] {
  if (!emotesStr) return [];
  const result: ChatEmote[] = [];
  const emoteGroups = emotesStr.split('/');

  for (const group of emoteGroups) {
    const [id, positions] = group.split(':');
    if (!id || !positions) continue;

    const ranges = positions.split(',');
    for (const range of ranges) {
      const [startStr, endStr] = range.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        // Note: Twitch emote end is inclusive index
        const name = messageText.slice(start, end + 1);
        result.push({ id, start, end, name });
      }
    }
  }

  // Sort by start position
  return result.sort((a, b) => a.start - b.start);
}

export type MessageHandler = (message: ChatMessage) => void;
export type DeleteMessageHandler = (messageId: string) => void;
export type ClearChatHandler = (username?: string) => void;
export type StatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

export class TwitchChatClient {
  private ws: WebSocket | null = null;
  private channel: string;
  private onMessage: MessageHandler;
  private onDeleteMessage?: DeleteMessageHandler;
  private onClearChat?: ClearChatHandler;
  private onStatusChange?: StatusHandler;
  private reconnectTimer: number | null = null;
  private shouldReconnect: boolean = true;
  private pingInterval: number | null = null;

  constructor(
    channel: string,
    options: {
      onMessage: MessageHandler;
      onDeleteMessage?: DeleteMessageHandler;
      onClearChat?: ClearChatHandler;
      onStatusChange?: StatusHandler;
    }
  ) {
    this.channel = channel.toLowerCase().trim().replace(/^#/, '');
    this.onMessage = options.onMessage;
    this.onDeleteMessage = options.onDeleteMessage;
    this.onClearChat = options.onClearChat;
    this.onStatusChange = options.onStatusChange;
  }

  public connect() {
    if (!this.channel) return;
    this.shouldReconnect = true;
    this.onStatusChange?.('connecting');

    try {
      this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

      this.ws.onopen = () => {
        this.onStatusChange?.('connected');
        const nick = `justinfan${Math.floor(10000 + Math.random() * 80000)}`;
        this.ws?.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        this.ws?.send(`NICK ${nick}`);
        this.ws?.send(`JOIN #${this.channel}`);

        // Setup ping keepalive
        this.pingInterval = window.setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send('PING :tmi.twitch.tv');
          }
        }, 60000);
      };

      this.ws.onmessage = (event) => {
        const rawLines = event.data.split('\r\n');
        for (const line of rawLines) {
          if (!line) continue;
          this.handleRawLine(line);
        }
      };

      this.ws.onerror = (err) => {
        console.error('Twitch WebSocket Error:', err);
        this.onStatusChange?.('error');
      };

      this.ws.onclose = () => {
        this.onStatusChange?.('disconnected');
        this.cleanupPing();
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      console.error('Failed to establish Twitch connection:', e);
      this.onStatusChange?.('error');
      this.scheduleReconnect();
    }
  }

  private handleRawLine(line: string) {
    if (line.startsWith('PING')) {
      this.ws?.send('PONG :tmi.twitch.tv');
      return;
    }

    let rawTags = '';
    let rest = line;

    if (line.startsWith('@')) {
      const spaceIdx = line.indexOf(' ');
      rawTags = line.slice(1, spaceIdx);
      rest = line.slice(spaceIdx + 1);
    }

    const tags = parseTags(rawTags);
    const parts = rest.split(' ');
    const command = parts[1];

    if (command === 'PRIVMSG') {
      const channel = (parts[2] || '').replace(/^#/, '');
      // Message content is after second colon
      const colonIdx = rest.indexOf(' :', rest.indexOf(command));
      let messageText = colonIdx !== -1 ? rest.slice(colonIdx + 2) : '';

      // Check for /me action: \u0001ACTION message\u0001
      let isAction = false;
      if (messageText.startsWith('\u0001ACTION ') && messageText.endsWith('\u0001')) {
        isAction = true;
        messageText = messageText.slice(8, -1);
      }

      const userMatch = parts[0].match(/^:([^!]+)!/);
      const username = userMatch ? userMatch[1] : (tags['display-name'] || 'anonymous').toLowerCase();
      const displayName = tags['display-name'] || username;
      const color = tags['color'] || getFallbackColor(username);
      const badges = parseBadges(tags['badges']);
      const emotes = parseEmotes(tags['emotes'], messageText);
      const id = tags['id'] || `${Date.now()}-${Math.random()}`;

      const chatMsg: ChatMessage = {
        id,
        channel,
        username,
        displayName,
        color,
        badges,
        emotes,
        text: messageText,
        isAction,
        timestamp: tags['tmi-sent-ts'] ? parseInt(tags['tmi-sent-ts'], 10) : Date.now(),
      };

      this.onMessage(chatMsg);
    } else if (command === 'CLEARCHAT') {
      // CLEAR ALL or CLEAR USER
      const userColon = rest.indexOf(' :');
      const targetUser = userColon !== -1 ? rest.slice(userColon + 2).trim() : undefined;
      this.onClearChat?.(targetUser);
    } else if (command === 'CLEARMSG') {
      // CLEAR SINGLE MESSAGE
      const targetMsgId = tags['target-msg-id'];
      if (targetMsgId) {
        this.onDeleteMessage?.(targetMsgId);
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) {
        this.connect();
      }
    }, 4000);
  }

  private cleanupPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    this.cleanupPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
