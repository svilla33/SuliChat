export interface ChatSettings {
  channel: string;
  style: string; // e.g. 'simple', 'custom1', 'custom2'
  fadeSeconds: number; // 0 = false (disabled), or number of seconds (e.g. 30)
  botActivity: boolean; // false = ignore commands like !song and bot nicks
  preventClipping: boolean;
  showBadges: boolean;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  channel: '',
  style: 'simple',
  fadeSeconds: 0,
  botActivity: false,
  preventClipping: false,
  showBadges: true,
};
