import React from 'react';
import type { ChatBadge } from '../services/twitchChat';

interface BadgesProps {
  badges: ChatBadge[];
}

// Official Twitch Badge CDN URLs (high-res 2x scale rendered at crisp 18x18px)
const OFFICIAL_TWITCH_BADGES: Record<string, { url: string; title: string }> = {
  broadcaster: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/2',
    title: 'Broadcaster',
  },
  moderator: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/2',
    title: 'Moderator',
  },
  vip: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/2',
    title: 'VIP',
  },
  partner: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/2',
    title: 'Verified Partner',
  },
  staff: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8f57-4e4bef88af34/2',
    title: 'Twitch Staff',
  },
  subscriber: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
    title: 'Subscriber',
  },
  founder: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/511b78a9-ab37-472f-9569-457753bbe7d3/2',
    title: 'Founder',
  },
  premium: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fb98ca1933/2',
    title: 'Prime Gaming',
  },
  turbo: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/bd444ec6-8f34-4bf9-91f4-af1e3428d80f/2',
    title: 'Twitch Turbo',
  },
  artist: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/4300a897-03dc-4e83-8c0e-c332fee7057f/2',
    title: 'Artist',
  },
  'artist-badge': {
    url: 'https://static-cdn.jtvnw.net/badges/v1/4300a897-03dc-4e83-8c0e-c332fee7057f/2',
    title: 'Artist',
  },
  'sub-gifter': {
    url: 'https://static-cdn.jtvnw.net/badges/v1/f1d8486f-eb2e-4553-b44f-4d614617afc1/2',
    title: 'Sub Gifter',
  },
  bits: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2f475b59411c/2',
    title: 'Cheer Bits',
  },
};

export const Badges: React.FC<BadgesProps> = ({ badges }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 align-middle mr-1.5 flex-shrink-0 select-none">
      {badges.map((badge, idx) => {
        const badgeInfo = OFFICIAL_TWITCH_BADGES[badge.type];

        if (badgeInfo) {
          return (
            <img
              key={`${badge.type}-${idx}`}
              src={badgeInfo.url}
              alt={badgeInfo.title}
              title={`${badgeInfo.title} (${badge.version})`}
              className="w-[18px] h-[18px] inline-block object-contain align-middle rounded-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
              loading="lazy"
            />
          );
        }

        // Generic fallback if unknown badge
        return null;
      })}
    </span>
  );
};
