import React, { useEffect, useState } from 'react';
import type { ChatBadge } from '../services/twitchChat';
import { getBadge, subscribeBadgeUpdates } from '../services/twitchBadges';

interface BadgesProps {
  badges: ChatBadge[];
  channel?: string;
}

export const Badges: React.FC<BadgesProps> = ({ badges, channel }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeBadgeUpdates(() => setTick((t) => t + 1));
  }, []);

  if (!badges || badges.length === 0) return null;

  return (
    <span className="badges">
      {badges.map((badge, idx) => {
        const badgeInfo = getBadge(badge.type, badge.version, channel);

        if (badgeInfo) {
          return (
            <img
              key={`${badge.type}-${badge.version}-${idx}`}
              className={`tag ${badge.type}-${badge.version}`}
              src={badgeInfo.url}
              alt={badgeInfo.title}
              title={badgeInfo.title}
              loading="lazy"
            />
          );
        }

        return null;
      })}
    </span>
  );
};
