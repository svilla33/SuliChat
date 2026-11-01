import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TwitchChatClient, type ChatMessage } from '../services/twitchChat';
import { loadBadgesForChannel } from '../services/twitchBadges';
import type { ChatSettings } from '../types/settings';
import { ChatMessageItem } from './ChatMessageItem';
import { useStyleLoader } from '../hooks/useStyleLoader';

interface ChatOverlayProps {
  settings: ChatSettings;
  isStandalone?: boolean;
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  mockMessages?: ChatMessage[];
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  settings,
  onConnectionStatus,
  mockMessages = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<TwitchChatClient | null>(null);

  // Load selected modular style (e.g. 'simple', 'custom1', 'custom2')
  useStyleLoader(settings.style || 'simple');

  // Filter bot messages if botActivity is false (like in KapChat)
  const filterMessage = (msg: ChatMessage) => {
    if (!settings.botActivity) {
      if (msg.text.startsWith('!')) return false;
      if (/bot$/i.test(msg.username)) return false;
    }
    return true;
  };

  const allMessages: ChatMessage[] = useMemo(() => {
    return [...messages, ...mockMessages]
      .filter(filterMessage)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, mockMessages, settings.botActivity]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [allMessages]);

  useEffect(() => {
    loadBadgesForChannel(settings.channel);

    if (!settings.channel) {
      setMessages([]);
      return;
    }

    setMessages([]);

    const client = new TwitchChatClient(settings.channel, {
      onMessage: (msg) => {
        setMessages((prev) => {
          const updated = [...prev, msg];
          return updated.length > 100 ? updated.slice(updated.length - 100) : updated;
        });
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
  }, [settings.channel, onConnectionStatus]);

  return (
    <div id="chat_box" ref={containerRef}>
      {allMessages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} settings={settings} />
      ))}
    </div>
  );
};
