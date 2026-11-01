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

  const { theme, strokeEffect, showBadges } = settings;

  // Boxed or minimal style
  const containerStyle =
    theme === 'boxed'
      ? 'bg-slate-900/80 backdrop-blur-md rounded-lg p-2.5 my-1.5 shadow-lg border border-slate-700/50'
      : theme === 'light'
      ? 'my-1 py-1 px-1.5 text-slate-900 drop-shadow-sm'
      : 'my-1 py-1 px-1.5 text-white';

  const strokeClass = strokeEffect
    ? '[text-shadow:_1px_1px_2px_rgba(0,0,0,0.9),_-1px_-1px_2px_rgba(0,0,0,0.9),_1px_-1px_2px_rgba(0,0,0,0.9),_-1px_1px_2px_rgba(0,0,0,0.9)]'
    : '';

  return (
    <div
      className={`transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 leading-relaxed break-words ${containerStyle}`}
      style={{ fontSize: `${settings.fontSize}px` }}
    >
      {showBadges && <Badges badges={message.badges} />}

      <span
        className={`font-bold mr-1.5 select-none ${strokeClass}`}
        style={{ color: message.color }}
      >
        {message.displayName}
      </span>

      {!message.isAction && <span className={`mr-1.5 select-none ${strokeClass}`}>:</span>}

      <span className={`break-words ${strokeClass}`}>
        <MessageRenderer
          text={message.text}
          emotes={message.emotes}
          isAction={message.isAction}
        />
      </span>
    </div>
  );
};
