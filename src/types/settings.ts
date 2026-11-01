export type ChatTheme = 'dark' | 'light' | 'minimal' | 'boxed';

export interface ChatSettings {
  channel: string;
  theme: ChatTheme;
  fontSize: number; // in pixels, default 16
  fadeSeconds: number; // 0 = never fade
  showBadges: boolean;
  strokeEffect: boolean; // text stroke for visibility on bright streams
  compactMode: boolean;
  soundAlert: boolean;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  channel: '',
  theme: 'dark',
  fontSize: 16,
  fadeSeconds: 0,
  showBadges: true,
  strokeEffect: true,
  compactMode: false,
  soundAlert: false,
};
