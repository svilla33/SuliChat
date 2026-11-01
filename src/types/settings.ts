export type ChatTheme = 'light' | 'boxed' | 'dark' | 'minimal';

export interface ChatSettings {
  channel: string;
  theme: ChatTheme;
  fontSize: number; // in pixels, default 16
  fadeSeconds: number; // 0 = never fade
  showBadges: boolean;
  strokeEffect: boolean; // text stroke for visibility
  compactMode: boolean;
  soundAlert: boolean;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  channel: '',
  theme: 'light',
  fontSize: 16,
  fadeSeconds: 0,
  showBadges: true,
  strokeEffect: false,
  compactMode: false,
  soundAlert: false,
};
