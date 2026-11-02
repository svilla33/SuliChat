// External Emote Service for 7TV, BetterTTV (BTTV), and FrankerFaceZ (FFZ)
import type { ExtraEmotes } from '../types/settings';

export interface ExternalEmote {
  id: string;
  code: string;
  url: string;
  srcSet?: string;
  service: '7tv' | 'bttv' | 'ffz';
  isZeroWidth?: boolean;
}

// Memory caches
const globalEmotes: Map<string, ExternalEmote> = new Map();
const channelEmotes: Map<string, Map<string, ExternalEmote>> = new Map();

// Listeners for when emotes finish loading
const listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('Listener error:', e);
    }
  });
}

export function subscribeEmoteUpdates(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Bundled high-frequency fallbacks so that even before API responds or if offline,
// standard popular emotes render instantly with high quality CDN webp/gif
const BUNDLED_FALLBACKS: ExternalEmote[] = [
  // 7TV Popular & Classics
  {
    id: '01M2FC504M1ZDJJHFVTXK4NWJN',
    code: 'PogChamp',
    url: 'https://cdn.7tv.app/emote/01M2FC504M1ZDJJHFVTXK4NWJN/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01M2FC504M1ZDJJHFVTXK4NWJN/1x.webp 1x, https://cdn.7tv.app/emote/01M2FC504M1ZDJJHFVTXK4NWJN/2x.webp 2x, https://cdn.7tv.app/emote/01M2FC504M1ZDJJHFVTXK4NWJN/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01FG1NDHJR0001XDR7G9054X2Q',
    code: 'HUH',
    url: 'https://cdn.7tv.app/emote/01FG1NDHJR0001XDR7G9054X2Q/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01FG1NDHJR0001XDR7G9054X2Q/1x.webp 1x, https://cdn.7tv.app/emote/01FG1NDHJR0001XDR7G9054X2Q/2x.webp 2x, https://cdn.7tv.app/emote/01FG1NDHJR0001XDR7G9054X2Q/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01FF3R5C30000FF5VVCKV49G6J',
    code: 'xdd',
    url: 'https://cdn.7tv.app/emote/01FF3R5C30000FF5VVCKV49G6J/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01FF3R5C30000FF5VVCKV49G6J/1x.webp 1x, https://cdn.7tv.app/emote/01FF3R5C30000FF5VVCKV49G6J/2x.webp 2x, https://cdn.7tv.app/emote/01FF3R5C30000FF5VVCKV49G6J/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01GF4GFD68000DZ3CYDB1JNQHQ',
    code: 'NOWAY',
    url: 'https://cdn.7tv.app/emote/01GF4GFD68000DZ3CYDB1JNQHQ/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01GF4GFD68000DZ3CYDB1JNQHQ/1x.webp 1x, https://cdn.7tv.app/emote/01GF4GFD68000DZ3CYDB1JNQHQ/2x.webp 2x, https://cdn.7tv.app/emote/01GF4GFD68000DZ3CYDB1JNQHQ/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01G9F2Q3H800080GCW6BK843J7',
    code: 'AlienDance',
    url: 'https://cdn.7tv.app/emote/01G9F2Q3H800080GCW6BK843J7/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01G9F2Q3H800080GCW6BK843J7/1x.webp 1x, https://cdn.7tv.app/emote/01G9F2Q3H800080GCW6BK843J7/2x.webp 2x, https://cdn.7tv.app/emote/01G9F2Q3H800080GCW6BK843J7/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01GCMQJGB0000D8ZK13J8KVCDX',
    code: 'PepePls',
    url: 'https://cdn.7tv.app/emote/01GCMQJGB0000D8ZK13J8KVCDX/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01GCMQJGB0000D8ZK13J8KVCDX/1x.webp 1x, https://cdn.7tv.app/emote/01GCMQJGB0000D8ZK13J8KVCDX/2x.webp 2x, https://cdn.7tv.app/emote/01GCMQJGB0000D8ZK13J8KVCDX/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01F7C6MV900006ERCCEQC5BKN1',
    code: 'gachiGASM',
    url: 'https://cdn.7tv.app/emote/01F7C6MV900006ERCCEQC5BKN1/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01F7C6MV900006ERCCEQC5BKN1/1x.webp 1x, https://cdn.7tv.app/emote/01F7C6MV900006ERCCEQC5BKN1/2x.webp 2x, https://cdn.7tv.app/emote/01F7C6MV900006ERCCEQC5BKN1/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01FGYPRTT0000BF1F0BAH6R39Q',
    code: 'WAYTOODANK',
    url: 'https://cdn.7tv.app/emote/01FGYPRTT0000BF1F0BAH6R39Q/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01FGYPRTT0000BF1F0BAH6R39Q/1x.webp 1x, https://cdn.7tv.app/emote/01FGYPRTT0000BF1F0BAH6R39Q/2x.webp 2x, https://cdn.7tv.app/emote/01FGYPRTT0000BF1F0BAH6R39Q/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01GE732B7R0002G1FA1JB1A2RR',
    code: 'AYAYA',
    url: 'https://cdn.7tv.app/emote/01GE732B7R0002G1FA1JB1A2RR/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01GE732B7R0002G1FA1JB1A2RR/1x.webp 1x, https://cdn.7tv.app/emote/01GE732B7R0002G1FA1JB1A2RR/2x.webp 2x, https://cdn.7tv.app/emote/01GE732B7R0002G1FA1JB1A2RR/4x.webp 4x',
    service: '7tv',
  },
  {
    id: '01FSNK0GP000038GDBZ91HT6SQ',
    code: 'PETPET',
    url: 'https://cdn.7tv.app/emote/01FSNK0GP000038GDBZ91HT6SQ/2x.webp',
    srcSet:
      'https://cdn.7tv.app/emote/01FSNK0GP000038GDBZ91HT6SQ/1x.webp 1x, https://cdn.7tv.app/emote/01FSNK0GP000038GDBZ91HT6SQ/2x.webp 2x, https://cdn.7tv.app/emote/01FSNK0GP000038GDBZ91HT6SQ/4x.webp 4x',
    service: '7tv',
  },

  // BTTV Verified Emotes
  {
    id: '5e9c6c187e090362f8b0b9e8',
    code: 'KEKW',
    url: 'https://cdn.betterttv.net/emote/5e9c6c187e090362f8b0b9e8/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/5e9c6c187e090362f8b0b9e8/1x 1x, https://cdn.betterttv.net/emote/5e9c6c187e090362f8b0b9e8/2x 2x, https://cdn.betterttv.net/emote/5e9c6c187e090362f8b0b9e8/3x 3x',
    service: 'bttv',
  },
  {
    id: '5f1b0186cf6d2144653d2970',
    code: 'catJAM',
    url: 'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/1x 1x, https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/2x 2x, https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/3x 3x',
    service: 'bttv',
  },
  {
    id: '566ca04265dbbdab32ec054a',
    code: 'monkaS',
    url: 'https://cdn.betterttv.net/emote/566ca04265dbbdab32ec054a/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/566ca04265dbbdab32ec054a/1x 1x, https://cdn.betterttv.net/emote/566ca04265dbbdab32ec054a/2x 2x, https://cdn.betterttv.net/emote/566ca04265dbbdab32ec054a/3x 3x',
    service: 'bttv',
  },
  {
    id: '59ca6551b27c823d5b1fd872',
    code: 'monkaW',
    url: 'https://cdn.betterttv.net/emote/59ca6551b27c823d5b1fd872/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/59ca6551b27c823d5b1fd872/1x 1x, https://cdn.betterttv.net/emote/59ca6551b27c823d5b1fd872/2x 2x, https://cdn.betterttv.net/emote/59ca6551b27c823d5b1fd872/3x 3x',
    service: 'bttv',
  },
  {
    id: '5e0fa9d40550d42106b8a489',
    code: 'widepeepoHappy',
    url: 'https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/1x 1x, https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/2x 2x, https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/3x 3x',
    service: 'bttv',
  },
  {
    id: '583089f4737a8e61abb0186b',
    code: 'OMEGALUL',
    url: 'https://cdn.betterttv.net/emote/583089f4737a8e61abb0186b/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/583089f4737a8e61abb0186b/1x 1x, https://cdn.betterttv.net/emote/583089f4737a8e61abb0186b/2x 2x, https://cdn.betterttv.net/emote/583089f4737a8e61abb0186b/3x 3x',
    service: 'bttv',
  },
  {
    id: '55b6f480e66682f576dd94f5',
    code: 'Clap',
    url: 'https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/1x 1x, https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/2x 2x, https://cdn.betterttv.net/emote/55b6f480e66682f576dd94f5/3x 3x',
    service: 'bttv',
  },
  {
    id: '56e9f494fff3cc5c35e5287e',
    code: 'EZ',
    url: 'https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/1x 1x, https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/2x 2x, https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/3x 3x',
    service: 'bttv',
  },
  {
    id: '5ff827395ef7d10c7912c106',
    code: 'Pog',
    url: 'https://cdn.betterttv.net/emote/5ff827395ef7d10c7912c106/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/5ff827395ef7d10c7912c106/1x 1x, https://cdn.betterttv.net/emote/5ff827395ef7d10c7912c106/2x 2x, https://cdn.betterttv.net/emote/5ff827395ef7d10c7912c106/3x 3x',
    service: 'bttv',
  },
  {
    id: '632322ff8d54637377075ec6',
    code: 'Sadge',
    url: 'https://cdn.betterttv.net/emote/632322ff8d54637377075ec6/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/632322ff8d54637377075ec6/1x 1x, https://cdn.betterttv.net/emote/632322ff8d54637377075ec6/2x 2x, https://cdn.betterttv.net/emote/632322ff8d54637377075ec6/3x 3x',
    service: 'bttv',
  },
  {
    id: '5b77ac3af7bddc567b1d5fb2',
    code: 'pepeJAM',
    url: 'https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/1x 1x, https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/2x 2x, https://cdn.betterttv.net/emote/5b77ac3af7bddc567b1d5fb2/3x 3x',
    service: 'bttv',
  },
  {
    id: '58ae8407ff7b7276f8e594f2',
    code: 'POGGERS',
    url: 'https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/1x 1x, https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/2x 2x, https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/3x 3x',
    service: 'bttv',
  },
  {
    id: '5a16ee718c22a247ead62d4a',
    code: 'peepoHappy',
    url: 'https://cdn.betterttv.net/emote/5a16ee718c22a247ead62d4a/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/5a16ee718c22a247ead62d4a/1x 1x, https://cdn.betterttv.net/emote/5a16ee718c22a247ead62d4a/2x 2x, https://cdn.betterttv.net/emote/5a16ee718c22a247ead62d4a/3x 3x',
    service: 'bttv',
  },
  {
    id: '5c548025009a2e73916b3a37',
    code: 'PepeLaugh',
    url: 'https://cdn.betterttv.net/emote/5c548025009a2e73916b3a37/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/5c548025009a2e73916b3a37/1x 1x, https://cdn.betterttv.net/emote/5c548025009a2e73916b3a37/2x 2x, https://cdn.betterttv.net/emote/5c548025009a2e73916b3a37/3x 3x',
    service: 'bttv',
  },
  {
    id: '609431bc39b5010444d0cbdc',
    code: 'GIGACHAD',
    url: 'https://cdn.betterttv.net/emote/609431bc39b5010444d0cbdc/2x',
    srcSet:
      'https://cdn.betterttv.net/emote/609431bc39b5010444d0cbdc/1x 1x, https://cdn.betterttv.net/emote/609431bc39b5010444d0cbdc/2x 2x, https://cdn.betterttv.net/emote/609431bc39b5010444d0cbdc/3x 3x',
    service: 'bttv',
  },
];

// Initialize bundled emotes into global cache
BUNDLED_FALLBACKS.forEach((e) => {
  globalEmotes.set(e.code, e);
});

// Load global 7TV, BTTV, FFZ emotes
let globalLoaded = false;
export async function loadGlobalEmotes(): Promise<void> {
  if (globalLoaded) return;
  globalLoaded = true;

  try {
    // 1. Fetch 7TV Global
    fetch('https://7tv.io/v3/emote-sets/global')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.emotes && Array.isArray(data.emotes)) {
          for (const item of data.emotes) {
            const isZeroWidth = (item.flags & 256) !== 0;
            globalEmotes.set(item.name, {
              id: item.id,
              code: item.name,
              url: `https://cdn.7tv.app/emote/${item.id}/2x.webp`,
              srcSet: `https://cdn.7tv.app/emote/${item.id}/1x.webp 1x, https://cdn.7tv.app/emote/${item.id}/2x.webp 2x, https://cdn.7tv.app/emote/${item.id}/4x.webp 4x`,
              service: '7tv',
              isZeroWidth,
            });
          }
          notifyListeners();
        }
      })
      .catch((err) => console.warn('7TV global fetch error:', err));

    // 2. Fetch BetterTTV Global
    fetch('https://api.betterttv.net/3/cached/emotes/global')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          for (const item of data) {
            globalEmotes.set(item.code, {
              id: item.id,
              code: item.code,
              url: `https://cdn.betterttv.net/emote/${item.id}/2x`,
              srcSet: `https://cdn.betterttv.net/emote/${item.id}/1x 1x, https://cdn.betterttv.net/emote/${item.id}/2x 2x, https://cdn.betterttv.net/emote/${item.id}/3x 3x`,
              service: 'bttv',
              isZeroWidth: item.modifier || false,
            });
          }
          notifyListeners();
        }
      })
      .catch((err) => console.warn('BTTV global fetch error:', err));

    // 3. Fetch FrankerFaceZ Global
    fetch('https://api.betterttv.net/3/cached/frankerfacez/emotes/global')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          for (const item of data) {
            const url2x = item.images?.['2x'] || item.images?.['1x'] || `https://cdn.betterttv.net/frankerfacez_emote/${item.id}/2`;
            globalEmotes.set(item.code, {
              id: String(item.id),
              code: item.code,
              url: url2x,
              service: 'ffz',
            });
          }
          notifyListeners();
        }
      })
      .catch((err) => console.warn('FFZ global fetch error:', err));
  } catch (e) {
    console.warn('Failed to load global external emotes:', e);
  }
}

// Immediately trigger global load in browser
if (typeof window !== 'undefined') {
  loadGlobalEmotes();
}

// Track channels currently loading to avoid duplicate requests
const loadingChannels = new Set<string>();

export async function loadExternalEmotesForChannel(channelName: string): Promise<void> {
  const clean = channelName.trim().toLowerCase().replace(/^#/, '');
  if (!clean || loadingChannels.has(clean)) return;

  if (channelEmotes.has(clean)) {
    return;
  }

  loadingChannels.add(clean);
  const channelMap = new Map<string, ExternalEmote>();
  channelEmotes.set(clean, channelMap);

  try {
    // First, resolve Twitch ID for this channel
    let twitchId = '';
    try {
      const idRes = await fetch(`https://decapi.me/twitch/id/${clean}`);
      if (idRes.ok) {
        const text = await idRes.text();
        if (/^\d+$/.test(text.trim())) {
          twitchId = text.trim();
        }
      }
    } catch {
      // Fallback: try IVR API
      try {
        const ivrRes = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${clean}`);
        if (ivrRes.ok) {
          const ivrData = await ivrRes.json();
          if (ivrData && Array.isArray(ivrData) && ivrData[0]?.id) {
            twitchId = ivrData[0].id;
          }
        }
      } catch {
        // Ignore fallback error
      }
    }

    // 1. Fetch 7TV Channel Emotes
    if (twitchId) {
      fetch(`https://7tv.io/v3/users/twitch/${twitchId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const emotes = data?.emote_set?.emotes;
          if (Array.isArray(emotes)) {
            for (const item of emotes) {
              const isZeroWidth = (item.flags & 256) !== 0;
              channelMap.set(item.name, {
                id: item.id,
                code: item.name,
                url: `https://cdn.7tv.app/emote/${item.id}/2x.webp`,
                srcSet: `https://cdn.7tv.app/emote/${item.id}/1x.webp 1x, https://cdn.7tv.app/emote/${item.id}/2x.webp 2x, https://cdn.7tv.app/emote/${item.id}/4x.webp 4x`,
                service: '7tv',
                isZeroWidth,
              });
            }
            notifyListeners();
          }
        })
        .catch(() => {});
    }

    // 2. Fetch BetterTTV Channel Emotes
    if (twitchId) {
      fetch(`https://api.betterttv.net/3/cached/users/twitch/${twitchId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const channelList = [...(data?.channelEmotes || []), ...(data?.sharedEmotes || [])];
          for (const item of channelList) {
            channelMap.set(item.code, {
              id: item.id,
              code: item.code,
              url: `https://cdn.betterttv.net/emote/${item.id}/2x`,
              srcSet: `https://cdn.betterttv.net/emote/${item.id}/1x 1x, https://cdn.betterttv.net/emote/${item.id}/2x 2x, https://cdn.betterttv.net/emote/${item.id}/3x 3x`,
              service: 'bttv',
              isZeroWidth: item.modifier || false,
            });
          }
          notifyListeners();
        })
        .catch(() => {});
    }

    // 3. Fetch FrankerFaceZ Channel Emotes (works directly with room name!)
    fetch(`https://api.frankerfacez.com/v1/room/${clean}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sets) {
          for (const setId of Object.keys(data.sets)) {
            const set = data.sets[setId];
            if (Array.isArray(set?.emoticons)) {
              for (const em of set.emoticons) {
                const url2x = em.urls?.['2'] || em.urls?.['1'] || `https://cdn.frankerfacez.com/emote/${em.id}/2`;
                channelMap.set(em.name, {
                  id: String(em.id),
                  code: em.name,
                  url: url2x,
                  service: 'ffz',
                });
              }
            }
          }
          notifyListeners();
        }
      })
      .catch(() => {});
  } finally {
    loadingChannels.delete(clean);
  }
}

// Find external emote given word and enabled service filters
export function findExternalEmote(
  word: string,
  channel?: string,
  extraEmotes?: ExtraEmotes
): ExternalEmote | undefined {
  if (!word) return undefined;

  // 1. Check channel-specific emotes first
  if (channel) {
    const clean = channel.trim().toLowerCase().replace(/^#/, '');
    const chanMap = channelEmotes.get(clean);
    if (chanMap && chanMap.has(word)) {
      const emote = chanMap.get(word)!;
      if (isServiceEnabled(emote.service, extraEmotes)) {
        return emote;
      }
    }
  }

  // 2. Check global emotes
  if (globalEmotes.has(word)) {
    const emote = globalEmotes.get(word)!;
    if (isServiceEnabled(emote.service, extraEmotes)) {
      return emote;
    }
  }

  return undefined;
}

function isServiceEnabled(service: '7tv' | 'bttv' | 'ffz', extraEmotes?: ExtraEmotes): boolean {
  if (!extraEmotes) return true;
  if (service === '7tv') return extraEmotes.sevenTv !== false;
  if (service === 'bttv') return extraEmotes.bttv !== false;
  if (service === 'ffz') return extraEmotes.ffz !== false;
  return true;
}
