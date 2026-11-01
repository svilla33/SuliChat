import React, { useEffect, useState } from 'react';
import type { ChatMessage } from '../services/twitchChat';
import type { ChatSettings } from '../types/settings';
import { Badges } from './Badges';
import { MessageRenderer } from '../utils/renderMessage';

interface ChatMessageItemProps {
  message: ChatMessage;
  settings: ChatSettings;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, settings }) => {
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (settings.fadeSeconds > 0) {
      const timer = setTimeout(() => {
        setFaded(true);
      }, settings.fadeSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [settings.fadeSeconds]);

  if (faded) {
    return null;
  }

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="chat_line"
      data-id={message.id}
      data-nick={message.username}
      data-timestamp={message.timestamp}
      style={{ '--user-color': message.color } as React.CSSProperties}
    >
      <span className="time_stamp">{timeString}</span>

      {settings.showBadges && (
        <Badges
          badges={message.badges}
          channel={message.channel || settings.channel}
        />
      )}

      <span className="nick" style={{ color: message.color }}>
        {message.displayName}
      </span>

      {!message.isAction ? (
        <>
          <span className="colon">:</span>&nbsp;
        </>
      ) : (
        <>&nbsp;</>
      )}

      <span
        className="message"
        style={message.isAction ? { color: message.color } : undefined}
      >
        <MessageRenderer
          text={message.text}
          emotes={message.emotes}
        />
      </span>
    </div>
  );
};
