import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TwitchChatClient, type ChatMessage } from '../services/twitchChat';
import { loadBadgesForChannel } from '../services/twitchBadges';
import { loadExternalEmotesForChannel } from '../services/externalEmotes';
import type { ChatSettings } from '../types/settings';
import { ChatMessageItem } from './ChatMessageItem';
import { useStyleLoader } from '../hooks/useStyleLoader';
import { playNotificationSound } from '../utils/audioNotification';

interface ChatOverlayProps {
  settings: ChatSettings;
  isStandalone?: boolean;
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  mockMessages?: ChatMessage[];
}

const COMMON_BOTS = new Set([
  'nightbot',
  'streamelements',
  'moobot',
  'wizebot',
  'fossabot',
  'streamlabs',
  'soundalerts',
  'sery_bot',
  'botisimo',
]);

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  settings,
  isStandalone = false,
  onConnectionStatus,
  mockMessages = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<TwitchChatClient | null>(null);
  const lastSoundPlayedRef = useRef<number>(0);

  // Load selected modular style (e.g. 'twitch', 'boxed', 'chunky', 'clean', 'old-school')
  useStyleLoader(settings.style || 'twitch');

  // Filter messages based on Streamlabs settings
  const filterMessage = (msg: ChatMessage) => {
    const userLower = msg.username.toLowerCase();

    // 1. Common bots filter
    if (settings.hideCommonBots) {
      if (COMMON_BOTS.has(userLower) || /bot$/i.test(userLower)) {
        return false;
      }
    }

    // 2. Hide commands starting with '!'
    if (settings.hideCommands && msg.text.trim().startsWith('!')) {
      return false;
    }

    // 3. Muted Chatters
    if (settings.mutedChatters && settings.mutedChatters.length > 0) {
      if (settings.mutedChatters.some((m) => m.toLowerCase().trim() === userLower)) {
        return false;
      }
    }

    return true;
  };

  const allMessages: ChatMessage[] = useMemo(() => {
    return [...messages, ...mockMessages]
      .filter(filterMessage)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, mockMessages, settings.hideCommonBots, settings.hideCommands, settings.mutedChatters]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [allMessages]);

  // Connect to Twitch Chat
  useEffect(() => {
    loadBadgesForChannel(settings.channel);
    loadExternalEmotesForChannel(settings.channel);

    if (!settings.channel) {
      setMessages([]);
      return;
    }

    setMessages([]);

    const client = new TwitchChatClient(settings.channel, {
      onMessage: (msg) => {
        // Trigger notification sound in standalone OBS overlay mode if enabled
        if (isStandalone && settings.notifications.enabled) {
          const now = Date.now();
          const thresholdMs = (settings.notifications.threshold || 30) * 1000;
          if (now - lastSoundPlayedRef.current >= thresholdMs) {
            lastSoundPlayedRef.current = now;
            playNotificationSound(settings.notifications.sound, settings.notifications.volume);
          }
        }

        // Handle chat delay
        if (settings.message.chatDelay > 0) {
          setTimeout(() => {
            setMessages((prev) => {
              const updated = [...prev, msg];
              return updated.length > 100 ? updated.slice(updated.length - 100) : updated;
            });
          }, settings.message.chatDelay * 1000);
        } else {
          setMessages((prev) => {
            const updated = [...prev, msg];
            return updated.length > 100 ? updated.slice(updated.length - 100) : updated;
          });
        }
      },
      onDeleteMessage: (msgId) => {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      },
      onClearChat: (username) => {
        if (!username) {
          setMessages([]);
        } else {
          setMessages((prev) => prev.filter((m) => m.username.toLowerCase() !== username.toLowerCase()));
        }
      },
      onStatusChange: (status) => {
        onConnectionStatus?.(status);
      },
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
    };
  }, [settings.channel, settings.message.chatDelay, settings.notifications, isStandalone, onConnectionStatus]);

  // Dynamically load Google Font if chosen font is not a standard system font
  useEffect(() => {
    const family = settings.font.family;
    if (!family) return;
    const systemFonts = [
      'Arial',
      'Arial Black',
      'Impact',
      'Courier New',
      'Comic Sans MS',
      'Trebuchet MS',
      'Verdana',
      'Times New Roman',
      'Georgia',
      'Tahoma',
      'sans-serif',
      'serif',
      'monospace',
    ];
    if (!systemFonts.includes(family)) {
      const linkId = `google-font-${family.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        // Single-weight pixel fonts vs multi-weight fonts
        const pixelFonts = [
          'Press Start 2P',
          'Pixelify Sans',
          'Silkscreen',
          'VT323',
          'DotGothic16',
          'Tiny5',
          'Jersey 10',
          'Jersey 15',
          'Jersey 25',
          'Micro 5',
          'Jacquard 12',
          'Rubik Glitch',
        ];
        const fontUrlParam = pixelFonts.includes(family)
          ? `${encodeURIComponent(family)}&display=swap`
          : `${encodeURIComponent(family)}:wght@400;600;700&display=swap`;
        link.href = `https://fonts.googleapis.com/css2?family=${fontUrlParam}`;
        document.head.appendChild(link);
      }
    }
  }, [settings.font.family]);

  // Universal font family and font size override across ALL styles
  useEffect(() => {
    let styleTag = document.getElementById('sulichat-font-rules') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'sulichat-font-rules';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      #chat_box, #log {
        font-family: "${settings.font.family}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: ${settings.font.size}px !important;
      }
      #chat_box .chat_line,
      #chat_box .message,
      #chat_box .nick,
      #chat_box .name,
      #chat_box .colon,
      #chat_box .meta,
      #log > div,
      #log .message,
      #log .nick,
      #log .name,
      #log .colon,
      #log .meta {
        font-family: inherit !important;
        font-size: inherit !important;
      }
    `;
  }, [settings.font.family, settings.font.size]);

  // CSS variables and styles applied directly to container
  const containerStyle: React.CSSProperties = {
    fontFamily: `"${settings.font.family}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    fontSize: `${settings.font.size}px`,
    color: settings.font.color,
    '--chat-font-family': `"${settings.font.family}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    '--chat-font-size': `${settings.font.size}px`,
    '--chat-font-color': settings.font.color,
  } as React.CSSProperties;

  return (
    <div id="chat_box" className="sl__chat__layout" ref={containerRef} style={containerStyle}>
      {allMessages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} settings={settings} />
      ))}
    </div>
  );
};
