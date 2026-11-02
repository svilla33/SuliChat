// Service to fetch and cache all official global and channel-specific Twitch badges

export interface BadgeAsset {
  setID: string;
  version: string;
  title: string;
  imageURL: string;
}

// In-memory cache
let globalBadgesCache: Map<string, BadgeAsset> | null = null;
const channelBadgesCache = new Map<string, Map<string, BadgeAsset>>();

// Fallback high-res static badges in case network is delayed or offline
export const STATIC_FALLBACK_BADGES: Record<string, { url: string; title: string }> = {
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
  predictions: {
    url: 'https://static-cdn.jtvnw.net/badges/v1/e41e57a3-5c82-4217-a068-15cf4649cc7c/2',
    title: 'Prediction Badge',
  },
  'hype-train': {
    url: 'https://static-cdn.jtvnw.net/badges/v1/59480cb4-77e8-466d-8b06-49a88e404b89/2',
    title: 'Hype Train',
  },
};

const TWITCH_GQL_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

// Listeners for badge updates
type BadgeListener = () => void;
const listeners = new Set<BadgeListener>();

export function subscribeBadgeUpdates(listener: BadgeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyBadgeUpdates() {
  listeners.forEach((fn) => fn());
}

/**
 * Fetch all Twitch global badges (event badges, rewards, etc.)
 * and channel custom badges (custom sub tiers, bits tiers, etc.)
 */
export async function loadBadgesForChannel(channel?: string) {
  const cleanChannel = channel ? channel.toLowerCase().trim().replace(/^#/, '') : '';

  const query = `
    query($hasChannel: Boolean!, $channelLogin: String!) {
      badges {
        setID
        version
        title
        imageURL
      }
      user(login: $channelLogin) @include(if: $hasChannel) {
        broadcastBadges {
          setID
          version
          title
          imageURL
        }
      }
    }
  `;

  try {
    const res = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_GQL_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          hasChannel: Boolean(cleanChannel),
          channelLogin: cleanChannel || 'none',
        },
      }),
    });

    if (!res.ok) return;
    const json = await res.json();
    const data = json?.data;

    // Cache global badges
    if (data?.badges && Array.isArray(data.badges)) {
      const gMap = new Map<string, BadgeAsset>();
      for (const b of data.badges) {
        // High-res version: replace /1 with /2 in Twitch CDN URL
        const hiResUrl = b.imageURL.replace(/\/1$/, '/2');
        gMap.set(`${b.setID}/${b.version}`, { ...b, imageURL: hiResUrl });
        // Also map just setID as fallback for version mismatch
        if (!gMap.has(b.setID)) {
          gMap.set(b.setID, { ...b, imageURL: hiResUrl });
        }
      }
      globalBadgesCache = gMap;
    }

    // Cache channel custom badges
    if (cleanChannel && data?.user?.broadcastBadges && Array.isArray(data.user.broadcastBadges)) {
      const cMap = new Map<string, BadgeAsset>();
      for (const b of data.user.broadcastBadges) {
        const hiResUrl = b.imageURL.replace(/\/1$/, '/2');
        cMap.set(`${b.setID}/${b.version}`, { ...b, imageURL: hiResUrl });
        if (!cMap.has(b.setID)) {
          cMap.set(b.setID, { ...b, imageURL: hiResUrl });
        }
      }
      channelBadgesCache.set(cleanChannel, cMap);
    }

    notifyBadgeUpdates();
  } catch (err) {
    console.warn('Could not fetch Twitch GQL badges, fallback will be used:', err);
  }
}

/**
 * Resolve badge asset: check channel custom badges first, then global badges, then static fallback.
 */
export function getBadge(
  type: string,
  version: string = '1',
  channel?: string
): { url: string; title: string } | null {
  const cleanChannel = channel ? channel.toLowerCase().trim().replace(/^#/, '') : '';
  const key = `${type}/${version}`;

  // 1. Check channel custom badges (e.g. channel specific sub badge tier)
  if (cleanChannel && channelBadgesCache.has(cleanChannel)) {
    const cMap = channelBadgesCache.get(cleanChannel)!;
    const match = cMap.get(key) || cMap.get(type);
    if (match) {
      return { url: match.imageURL, title: match.title };
    }
  }

  // 2. Check dynamic global badges (550+ Twitch event/custom badges)
  if (globalBadgesCache) {
    const match = globalBadgesCache.get(key) || globalBadgesCache.get(type);
    if (match) {
      return { url: match.imageURL, title: match.title };
    }
  }

  // 3. Fallback to static official badges
  const fallback = STATIC_FALLBACK_BADGES[type];
  if (fallback) {
    return fallback;
  }

  return null;
}
