import React, { useEffect, useState } from 'react';
import type { ChatBadge } from '../services/twitchChat';
import { getBadge, subscribeBadgeUpdates } from '../services/twitchBadges';
import type { BadgeFilters } from '../types/settings';

interface BadgesProps {
  badges: ChatBadge[];
  channel?: string;
  badgeFilters?: BadgeFilters;
}

const CORE_KNOWN_TYPES = new Set([
  'broadcaster',
  'moderator',
  'vip',
  'subscriber',
  'founder',
  'artist',
  'artist-badge',
  'partner',
  'staff',
  'admin',
  'global_mod',
  'turbo',
  'premium',
  'prime',
  'bits',
  'sub-gifter',
  'sub_gifter',
]);

export const Badges: React.FC<BadgesProps> = ({ badges, channel, badgeFilters }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeBadgeUpdates(() => setTick((t) => t + 1));
  }, []);

  if (!badges || badges.length === 0) return null;

  const filtered = badges.filter((b) => {
    if (!badgeFilters) return true;
    const t = b.type.toLowerCase();

    // Specific filters for core/support roles
    if (t === 'broadcaster' && !badgeFilters.broadcaster) return false;
    if (t === 'moderator' && !badgeFilters.moderator) return false;
    if (t === 'vip' && !badgeFilters.vip) return false;
    if ((t === 'subscriber' || t === 'founder') && !badgeFilters.subscriber) return false;
    if ((t === 'artist' || t === 'artist-badge') && !badgeFilters.artist) return false;
    if (t === 'turbo' && !badgeFilters.turbo) return false;
    if ((t === 'premium' || t === 'prime') && !badgeFilters.prime) return false;
    if (t === 'bits' && !badgeFilters.bits) return false;
    if ((t === 'sub-gifter' || t === 'sub_gifter') && !badgeFilters.subGifter) return false;

    // Filter out the 500+ Twitch event, prediction, hype train, and drop badges
    if (!CORE_KNOWN_TYPES.has(t)) {
      if (!badgeFilters.twitchRewards) {
        return false;
      }
    }

    return true;
  });

  if (filtered.length === 0) return null;

  return (
    <span className="badges">
      {filtered.map((badge, idx) => {
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
