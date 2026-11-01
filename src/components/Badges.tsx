import React, { useEffect, useState } from 'react';
import type { ChatBadge } from '../services/twitchChat';
import { getBadge, subscribeBadgeUpdates } from '../services/twitchBadges';

interface BadgesProps {
  badges: ChatBadge[];
  channel?: string;
}

export const Badges: React.FC<BadgesProps> = ({ badges, channel }) => {
  // Trigger re-render whenever dynamic badges are loaded
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeBadgeUpdates(() => setTick((t) => t + 1));
  }, []);

  if (!badges || badges.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 align-middle mr-1.5 flex-shrink-0 select-none">
      {badges.map((badge, idx) => {
        const badgeInfo = getBadge(badge.type, badge.version, channel);

        if (badgeInfo) {
          return (
            <img
              key={`${badge.type}-${badge.version}-${idx}`}
              src={badgeInfo.url}
              alt={badgeInfo.title}
              title={`${badgeInfo.title}`}
              className="w-[18px] h-[18px] inline-block object-contain align-middle rounded-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
              loading="lazy"
            />
          );
        }

        return null;
      })}
    </span>
  );
};
