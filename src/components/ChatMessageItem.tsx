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
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Message hide delay / fade
  useEffect(() => {
    if (!settings.message.alwaysShow && settings.message.hideAfterSeconds > 0) {
      const fadeStartTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, Math.max(0, (settings.message.hideAfterSeconds - 0.5) * 1000));

      const removeTimer = setTimeout(() => {
        setFaded(true);
      }, settings.message.hideAfterSeconds * 1000);

      return () => {
        clearTimeout(fadeStartTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [settings.message.alwaysShow, settings.message.hideAfterSeconds]);

  if (faded) {
    return null;
  }

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Filter or censor custom bad words
  let processedText = message.text;
  if (settings.customBadWords && settings.customBadWords.length > 0) {
    for (const badWord of settings.customBadWords) {
      if (!badWord.trim()) continue;
      const regex = new RegExp(`\\b${badWord.trim()}\\b`, 'gi');
      processedText = processedText.replace(regex, '*'.repeat(badWord.length));
    }
  }

  const animationStyle: React.CSSProperties = {
    transition: 'opacity 0.5s ease, transform 0.3s ease',
    opacity: isFadingOut ? 0 : 1,
    transform: isFadingOut ? 'scale(0.98)' : 'none',
  };

  return (
    <div
      className={`chat_line ${settings.message.animationsEnabled ? 'sl-chat-item-animate' : ''}`}
      data-id={message.id}
      data-nick={message.username}
      data-timestamp={message.timestamp}
      style={{
        '--user-color': message.color,
        ...animationStyle,
      } as React.CSSProperties}
    >
      <span className="time_stamp">{timeString}</span>

      {/* User Meta (Left column in colum style, inline in others) */}
      <span className="meta" style={{ color: message.color }}>
        {settings.showPlatformIcon && (
          <span className="platform-icon" title="Twitch">
            <svg className="w-3.5 h-3.5 fill-[#9146FF] inline-block mr-1 align-middle" viewBox="0 0 24 24">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
            </svg>
          </span>
        )}

        <Badges
          badges={message.badges}
          channel={message.channel || settings.channel}
          badgeFilters={settings.badges}
        />

        <span className="nick name" style={{ color: message.color }}>
          {message.displayName}
        </span>
      </span>

      {!message.isAction ? (
        <span className="colon">:</span>
      ) : (
        <>&nbsp;</>
      )}

      {/* Text with Emotes (Twitch + 7TV + BTTV + FFZ) */}
      <span
        className="message"
        style={message.isAction ? { color: message.color } : { color: settings.font.color }}
      >
        <MessageRenderer
          text={processedText}
          emotes={message.emotes}
          channel={message.channel || settings.channel}
          extraEmotes={settings.extraEmotes}
        />
      </span>
    </div>
  );
};
