import React, { useEffect, useState } from 'react';
import type { ChatEmote } from '../services/twitchChat';
import type { ExtraEmotes } from '../types/settings';
import {
  findExternalEmote,
  subscribeEmoteUpdates,
  type ExternalEmote,
} from '../services/externalEmotes';

export interface MessageChunk {
  type: 'text' | 'twitch-emote' | 'external-emote';
  content: string;
  twitchEmoteId?: string;
  externalEmote?: ExternalEmote;
}

// Parse text chunks checking for both Twitch IRC emotes and external (7TV, BTTV, FFZ) emotes
export function parseFullMessageChunks(
  text: string,
  emotes: ChatEmote[] = [],
  channel?: string,
  extraEmotes?: ExtraEmotes
): MessageChunk[] {
  if (!text) return [];

  // 1. Slice text around Twitch native emotes
  const segments: Array<{ isTwitchEmote: boolean; content: string; emoteId?: string }> = [];

  if (emotes && emotes.length > 0) {
    // Sort emotes by start index
    const sorted = [...emotes].sort((a, b) => a.start - b.start);
    let lastIdx = 0;

    for (const em of sorted) {
      // Validate bounds
      if (em.start >= text.length) continue;
      const validStart = Math.max(0, em.start);
      const validEnd = Math.min(text.length - 1, em.end);

      if (validStart > lastIdx) {
        segments.push({
          isTwitchEmote: false,
          content: text.slice(lastIdx, validStart),
        });
      }

      const emoteWord = em.name || text.slice(validStart, validEnd + 1);
      segments.push({
        isTwitchEmote: true,
        content: emoteWord,
        emoteId: em.id,
      });

      lastIdx = validEnd + 1;
    }

    if (lastIdx < text.length) {
      segments.push({
        isTwitchEmote: false,
        content: text.slice(lastIdx),
      });
    }
  } else {
    segments.push({ isTwitchEmote: false, content: text });
  }

  // 2. In non-Twitch segments, parse external emotes (7TV, BTTV, FFZ) by splitting words
  const result: MessageChunk[] = [];

  for (const seg of segments) {
    if (seg.isTwitchEmote && seg.emoteId) {
      result.push({
        type: 'twitch-emote',
        content: seg.content,
        twitchEmoteId: seg.emoteId,
      });
      continue;
    }

    // Split words while preserving spaces
    const parts = seg.content.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;

      if (/^\s+$/.test(part)) {
        result.push({ type: 'text', content: part });
        continue;
      }

      // Check external emote
      const ext = findExternalEmote(part, channel, extraEmotes);
      if (ext) {
        result.push({
          type: 'external-emote',
          content: part,
          externalEmote: ext,
        });
      } else {
        result.push({
          type: 'text',
          content: part,
        });
      }
    }
  }

  return result;
}

export const MessageRenderer: React.FC<{
  text: string;
  emotes?: ChatEmote[];
  channel?: string;
  extraEmotes?: ExtraEmotes;
}> = ({ text, emotes = [], channel, extraEmotes }) => {
  const [, setTick] = useState(0);

  // Subscribe to asynchronous emote updates (7TV, BTTV, FFZ)
  useEffect(() => {
    return subscribeEmoteUpdates(() => setTick((t) => t + 1));
  }, []);

  const chunks = parseFullMessageChunks(text, emotes, channel, extraEmotes);

  return (
    <>
      {chunks.map((chunk, idx) => {
        if (chunk.type === 'twitch-emote' && chunk.twitchEmoteId) {
          return (
            <img
              key={`ttv-${chunk.twitchEmoteId}-${idx}`}
              className={`emoticon ttv-emo-${chunk.twitchEmoteId}`}
              src={`https://static-cdn.jtvnw.net/emoticons/v2/${chunk.twitchEmoteId}/default/dark/2.0`}
              srcSet={`https://static-cdn.jtvnw.net/emoticons/v2/${chunk.twitchEmoteId}/default/dark/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v2/${chunk.twitchEmoteId}/default/dark/2.0 2x, https://static-cdn.jtvnw.net/emoticons/v2/${chunk.twitchEmoteId}/default/dark/3.0 4x`}
              alt={chunk.content}
              title={chunk.content}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.srcset) {
                  img.removeAttribute('srcset');
                }
              }}
            />
          );
        }

        if (chunk.type === 'external-emote' && chunk.externalEmote) {
          const { url, srcSet, code, isZeroWidth, service } = chunk.externalEmote;
          return (
            <img
              key={`ext-${service}-${code}-${idx}`}
              className={`emoticon emote-${service} ${isZeroWidth ? 'emoticon-zero-width' : ''}`}
              src={url}
              srcSet={srcSet}
              alt={code}
              title={`${code} (${service.toUpperCase()})`}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.srcset) {
                  img.removeAttribute('srcset');
                } else {
                  // Fallback to text if CDN fails completely
                  img.style.display = 'none';
                  const span = document.createElement('span');
                  span.textContent = code;
                  img.parentNode?.insertBefore(span, img);
                }
              }}
            />
          );
        }

        return <span key={idx}>{chunk.content}</span>;
      })}
    </>
  );
};
