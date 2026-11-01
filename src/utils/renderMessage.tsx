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

  // Sort emotes by start index ascending
  const sortedEmotes = [...emotes].sort((a, b) => a.start - b.start);
  const chunks: MessageChunk[] = [];
  let lastIndex = 0;

  for (const emote of sortedEmotes) {
    // If there is gap between last position and emote start, add text chunk
    if (emote.start > lastIndex) {
      chunks.push({
        type: 'text',
        content: text.slice(lastIndex, emote.start),
      });
    }

    // Add emote chunk
    chunks.push({
      type: 'emote',
      content: emote.name || text.slice(emote.start, emote.end + 1),
      emoteId: emote.id,
    });

    lastIndex = emote.end + 1;
  }

  // Add trailing text
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
  isAction?: boolean;
}> = ({ text, emotes, isAction }) => {
  const chunks = parseMessageSegments(text, emotes);

  return (
    <span className={isAction ? 'italic opacity-90' : ''}>
      {chunks.map((chunk, idx) => {
        if (chunk.type === 'emote' && chunk.emoteId) {
          return (
            <img
              key={idx}
              src={`https://static-cdn.jtvnw.net/emoticons/v2/${chunk.emoteId}/default/dark/2.0`}
              alt={chunk.content}
              title={chunk.content}
              className="inline-block mx-0.5 align-middle max-h-[1.5em] w-auto select-none"
              loading="lazy"
            />
          );
        }
        return <span key={idx}>{chunk.content}</span>;
      })}
    </span>
  );
};
