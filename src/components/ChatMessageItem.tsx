import React, { useEffect, useState, useMemo } from 'react';
import type { ChatMessage } from '../services/twitchChat';
import type { ChatSettings } from '../types/settings';
import { Badges } from './Badges';
import { MessageRenderer } from '../utils/renderMessage';

interface ChatMessageItemProps {
  message: ChatMessage;
  settings: ChatSettings;
}

// Ensure bright colors (like #FFFF00 or neon greens) are easily readable on white background
function getReadableColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#') || hexColor.length < 7) {
    return hexColor || '#0f172a';
  }
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hexColor;

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance > 0.65) {
    const factor = 0.6;
    const dr = Math.floor(r * factor).toString(16).padStart(2, '0');
    const dg = Math.floor(g * factor).toString(16).padStart(2, '0');
    const db = Math.floor(b * factor).toString(16).padStart(2, '0');
    return `#${dr}${dg}${db}`;
  }
  return hexColor;
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

  const userColor = useMemo(() => getReadableColor(message.color), [message.color]);

  if (faded) {
    return null;
  }

  const { theme, strokeEffect, showBadges } = settings;

  // Boxed or minimal style for white background
  const containerStyle =
    theme === 'boxed'
      ? 'bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 my-1.5 shadow-sm text-slate-900'
      : theme === 'dark'
      ? 'bg-slate-900/90 text-white rounded-xl p-2.5 my-1.5 shadow-md'
      : 'my-1 py-1 px-1.5 text-slate-900';

  const strokeClass = strokeEffect
    ? '[text-shadow:_1px_1px_1px_rgba(0,0,0,0.15)]'
    : '';

  return (
    <div
      className={`transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 leading-relaxed break-words font-medium ${containerStyle}`}
      style={{ fontSize: `${settings.fontSize}px` }}
    >
      {showBadges && (
        <Badges
          badges={message.badges}
          channel={message.channel || settings.channel}
        />
      )}

      <span
        className={`font-bold mr-1.5 select-none ${strokeClass}`}
        style={{ color: userColor }}
      >
        {message.displayName}
      </span>

      {!message.isAction && <span className={`mr-1.5 select-none text-slate-400 ${strokeClass}`}>:</span>}

      <span className={`break-words text-slate-800 ${strokeClass}`}>
        <MessageRenderer
          text={message.text}
          emotes={message.emotes}
          isAction={message.isAction}
        />
      </span>
    </div>
  );
};
