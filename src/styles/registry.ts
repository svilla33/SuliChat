import { useEffect, useState } from 'react';
import themesData from './themes.json';

export interface ChatStyle {
  id: string;
  name: string;
  description: string;
  cssUrl: string;
  jsUrl?: string;
  isCustom?: boolean;
}

export const KNOWN_METADATA: Record<string, { name: string; description: string }> = themesData;

const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

// Initial default styles generated dynamically from themes.json
export const DEFAULT_STYLES: ChatStyle[] = Object.entries(KNOWN_METADATA).map(([id, meta]) => ({
  id,
  name: meta.name,
  description: meta.description,
  cssUrl: `${base}chat-styles/${id}/style.css`,
}));

let activeStylesCache: ChatStyle[] = [...DEFAULT_STYLES];
const listeners = new Set<(styles: ChatStyle[]) => void>();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn(activeStylesCache);
    } catch (e) {
      console.warn('Style listener error:', e);
    }
  });
}

// Fetch live list of styles from server or manifest.json
export async function fetchLiveStyles(): Promise<ChatStyle[]> {
  try {
    // Try Vite dev server middleware first, then static manifest
    let res = await fetch('/api/styles', { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch(`${base}chat-styles/manifest.json`, { cache: 'no-store' });
    }
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        activeStylesCache = data;
        notifyListeners();
        return data;
      }
    }
  } catch {
    // Fallback to cache if network fails
  }
  return activeStylesCache;
}

// React hook to access available styles dynamically
export function useAvailableStyles(): ChatStyle[] {
  const [styles, setStyles] = useState<ChatStyle[]>(activeStylesCache);

  useEffect(() => {
    // 1. Initial fetch
    fetchLiveStyles().then(setStyles);

    // 2. Subscribe to internal changes
    const unsub = (newStyles: ChatStyle[]) => setStyles(newStyles);
    listeners.add(unsub);

    // 3. Listen to Vite HMR events when folders in public/chat-styles change
    if (import.meta.hot) {
      import.meta.hot.on('sulichat:styles-changed', () => {
        fetchLiveStyles().then(setStyles);
      });
    }

    // 4. Also refresh when window regains focus (e.g. user modified folders in file explorer)
    const onFocus = () => {
      fetchLiveStyles().then(setStyles);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      listeners.delete(unsub);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return styles;
}

export function getStyleConfig(styleId: string): ChatStyle {
  let cleanId = (styleId || 'twitch').toLowerCase().trim();
  if (['bubbles', 'chat-texto', 'sms', 'textchat'].includes(cleanId)) {
    cleanId = 'text-chat';
  }
  const found = activeStylesCache.find((s) => s.id === cleanId);
  if (found) return found;

  const meta = KNOWN_METADATA[cleanId];
  return {
    id: cleanId,
    name: meta?.name || cleanId.charAt(0).toUpperCase() + cleanId.slice(1).replace(/[-_]/g, ' '),
    description: meta?.description || `Estilo cargado desde /chat-styles/${cleanId}/`,
    cssUrl: `${base}chat-styles/${cleanId}/style.css`,
    jsUrl: `${base}chat-styles/${cleanId}/script.js`,
    isCustom: !meta,
  };
}
