import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TwitchChatClient, type ChatMessage } from '../services/twitchChat';
import { loadBadgesForChannel } from '../services/twitchBadges';
import type { ChatSettings } from '../types/settings';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatOverlayProps {
  settings: ChatSettings;
  isStandalone?: boolean; // When loaded directly in OBS or iframe
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  mockMessages?: ChatMessage[];
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  settings,
  isStandalone = false,
  onConnectionStatus,
  mockMessages = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<TwitchChatClient | null>(null);

  // Combine real chat messages with simulated test messages if provided
  const allMessages: ChatMessage[] = useMemo(() => {
    return [...messages, ...mockMessages].sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, mockMessages]);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [allMessages]);

  useEffect(() => {
    // Load badges dynamically for channel and global
    loadBadgesForChannel(settings.channel);

    if (!settings.channel) {
      setMessages([]);
      return;
    }

    setMessages([]);

    const client = new TwitchChatClient(settings.channel, {
      onMessage: (msg) => {
        setMessages((prev) => {
          // Keep max 100 messages in memory
          const updated = [...prev, msg];
          return updated.length > 100 ? updated.slice(updated.length - 100) : updated;
        });
      },
      onDeleteMessage: (msgId) => {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      },
      onClearChat: (username) => {
        if (!username) {
          // Cleared entire chat
          setMessages([]);
        } else {
          // Purged user
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
    <div
      ref={containerRef}
      className={`w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-end p-3 ${
        isStandalone ? 'bg-white text-slate-900' : ''
      }`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div className="flex flex-col space-y-1">
        {allMessages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} settings={settings} />
        ))}
      </div>
    </div>
  );
};
