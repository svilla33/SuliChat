import React from 'react';
import type { ChatBadge } from '../services/twitchChat';

interface BadgesProps {
  badges: ChatBadge[];
}

export const Badges: React.FC<BadgesProps> = ({ badges }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 align-middle mr-1.5 flex-shrink-0">
      {badges.map((badge, idx) => {
        const { type } = badge;
        
        if (type === 'broadcaster') {
          return (
            <span
              key={idx}
              title="Broadcaster"
              className="inline-flex items-center justify-center px-1 rounded bg-red-600 text-white text-[11px] font-bold leading-tight shadow-sm"
            >
              STREAMER
            </span>
          );
        }

        if (type === 'moderator') {
          return (
            <span
              key={idx}
              title="Moderator"
              className="inline-flex items-center justify-center px-1 rounded bg-emerald-600 text-white text-[11px] font-bold leading-tight shadow-sm"
            >
              MOD
            </span>
          );
        }

        if (type === 'vip') {
          return (
            <span
              key={idx}
              title="VIP"
              className="inline-flex items-center justify-center px-1 rounded bg-purple-600 text-white text-[11px] font-bold leading-tight shadow-sm"
            >
              VIP
            </span>
          );
        }

        if (type === 'subscriber') {
          return (
            <span
              key={idx}
              title="Subscriber"
              className="inline-flex items-center justify-center px-1 rounded bg-amber-500 text-white text-[11px] font-bold leading-tight shadow-sm"
            >
              SUB
            </span>
          );
        }

        if (type === 'partner') {
          return (
            <span
              key={idx}
              title="Verified Partner"
              className="inline-flex items-center justify-center px-1 rounded bg-cyan-600 text-white text-[11px] font-bold leading-tight shadow-sm"
            >
              ✓
            </span>
          );
        }

        if (type === 'premium' || type === 'turbo') {
          return (
            <span
              key={idx}
              title="Prime / Turbo"
              className="inline-flex items-center justify-center px-1 rounded bg-blue-500 text-white text-[11px] font-bold leading-tight shadow-sm"
            >
              ⚡
            </span>
          );
        }

        return null;
      })}
    </span>
  );
};
