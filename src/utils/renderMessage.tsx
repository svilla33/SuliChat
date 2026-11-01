import React from 'react';
import type { ChatEmote } from '../services/twitchChat';

interface MessageChunk {
  type: 'text' | 'emote';
  content: string;
  emoteId?: string;
}

export function parseMessageSegments(text: string, emotes: ChatEmote[]): MessageChunk[] {
  if (!emotes || emotes.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const sortedEmotes = [...emotes].sort((a, b) => a.start - b.start);
  const chunks: MessageChunk[] = [];
  let lastIndex = 0;

  for (const emote of sortedEmotes) {
    if (emote.start > lastIndex) {
      chunks.push({
        type: 'text',
        content: text.slice(lastIndex, emote.start),
      });
    }

    chunks.push({
      type: 'emote',
      content: emote.name || text.slice(emote.start, emote.end + 1),
      emoteId: emote.id,
    });

    lastIndex = emote.end + 1;
  }

  if (lastIndex < text.length) {
    chunks.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return chunks;
}

export const MessageRenderer: React.FC<{
  text: string;
  emotes: ChatEmote[];
}> = ({ text, emotes }) => {
  const chunks = parseMessageSegments(text, emotes);

  return (
    <>
      {chunks.map((chunk, idx) => {
        if (chunk.type === 'emote' && chunk.emoteId) {
          return (
            <img
              key={idx}
              className={`emoticon ttv-emo-${chunk.emoteId}`}
              src={`https://static-cdn.jtvnw.net/emoticons/v2/${chunk.emoteId}/default/dark/1.0`}
              srcSet={`https://static-cdn.jtvnw.net/emoticons/v2/${chunk.emoteId}/default/dark/2.0 2x, https://static-cdn.jtvnw.net/emoticons/v2/${chunk.emoteId}/default/dark/3.0 4x`}
              alt={chunk.content}
              title={chunk.content}
              loading="lazy"
            />
          );
        }
        return <span key={idx}>{chunk.content}</span>;
      })}
    </>
  );
};
