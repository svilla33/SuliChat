export interface BadgeFilters {
  broadcaster: boolean;
  moderator: boolean;
  vip: boolean;
  subscriber: boolean;
  artist: boolean;
  turbo: boolean;
  prime: boolean;
  bits: boolean;
  subGifter: boolean;
  twitchRewards: boolean; // Hide/show the 500+ Twitch event, prediction, drop, and giveaway badges
}

export interface ExtraEmotes {
  bttv: boolean;
  ffz: boolean;
  sevenTv: boolean;
  twitchGifs: boolean;
}

export interface ChatNotifications {
  enabled: boolean;
  sound: string;
  volume: number; // 0 - 100
  threshold: number; // in seconds (e.g. 30)
}

export interface FontSettings {
  family: string;
  color: string;
  size: number; // in px
}

export interface MessageSettings {
  chatDelay: number; // in seconds (0 - 60)
  alwaysShow: boolean;
  hideAfterSeconds: number; // default 15
  animationsEnabled: boolean;
}

export interface ChatSettings {
  channel: string;
  platform: 'twitch' | 'youtube' | 'kick';
  style: string; // 'twitch', 'boxed', 'chunky', 'clean', 'old-school'
  badges: BadgeFilters;
  showPlatformIcon: boolean;
  extraEmotes: ExtraEmotes;
  hideCommonBots: boolean;
  hideCommands: boolean;
  mutedChatters: string[];
  customBadWords: string[];
  notifications: ChatNotifications;
  font: FontSettings;
  message: MessageSettings;
  previewBg: string;

  // Legacy compatibility fields
  fadeSeconds?: number;
  botActivity?: boolean;
  preventClipping?: boolean;
  showBadges?: boolean;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  channel: '',
  platform: 'twitch',
  style: 'twitch',
  badges: {
    broadcaster: true,
    moderator: true,
    vip: true,
    subscriber: true,
    artist: true,
    turbo: true,
    prime: true,
    bits: true,
    subGifter: true,
    twitchRewards: false, // Default to FALSE to eliminate clutter from Twitch's massive badge catalog
  },
  showPlatformIcon: false,
  extraEmotes: {
    bttv: true,
    ffz: true,
    sevenTv: true,
    twitchGifs: true,
  },
  hideCommonBots: true,
  hideCommands: true,
  mutedChatters: [],
  customBadWords: [],
  notifications: {
    enabled: false,
    sound: 'positive-game-sound-4.ogg',
    volume: 50,
    threshold: 30,
  },
  font: {
    family: 'Open Sans',
    color: '#f0f0f0',
    size: 12,
  },
  message: {
    chatDelay: 0,
    alwaysShow: true,
    hideAfterSeconds: 15,
    animationsEnabled: true,
  },
  previewBg: '#444f6f',

  // Legacy KapChat fallbacks
  fadeSeconds: 15,
  botActivity: false,
  preventClipping: false,
  showBadges: true,
};

const STORAGE_KEY = 'sulichat_settings_v2';

export function saveSettingsToStorage(settings: ChatSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

export function loadSettingsFromStorage(): ChatSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      badges: { ...DEFAULT_SETTINGS.badges, ...(parsed.badges || {}) },
      extraEmotes: { ...DEFAULT_SETTINGS.extraEmotes, ...(parsed.extraEmotes || {}) },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
      font: { ...DEFAULT_SETTINGS.font, ...(parsed.font || {}) },
      message: { ...DEFAULT_SETTINGS.message, ...(parsed.message || {}) },
    };
  } catch (e) {
    console.warn('Failed to parse settings from localStorage:', e);
    return null;
  }
}

// Convert settings to URL search params for OBS browser source
export function settingsToSearchParams(settings: ChatSettings): URLSearchParams {
  const params = new URLSearchParams();
  if (settings.channel) params.set('channel', settings.channel);
  if (settings.platform !== 'twitch') params.set('platform', settings.platform);
  params.set('style', settings.style || 'twitch');

  // Font
  if (settings.font.family !== DEFAULT_SETTINGS.font.family) params.set('font_family', settings.font.family);
  if (settings.font.color !== DEFAULT_SETTINGS.font.color) params.set('font_color', settings.font.color);
  if (settings.font.size !== DEFAULT_SETTINGS.font.size) params.set('font_size', settings.font.size.toString());

  // Message
  if (settings.message.alwaysShow) {
    params.set('fade', 'false');
  } else {
    params.set('fade', settings.message.hideAfterSeconds.toString());
  }
  if (settings.message.chatDelay > 0) params.set('delay', settings.message.chatDelay.toString());
  if (!settings.message.animationsEnabled) params.set('anim', 'false');

  // Flags
  if (settings.showPlatformIcon) params.set('icons', 'true');
  if (!settings.hideCommonBots) params.set('hide_bots', 'false');
  if (!settings.hideCommands) params.set('hide_cmds', 'false');

  // Badges
  const disabledBadges = Object.entries(settings.badges)
    .filter(([, val]) => !val)
    .map(([key]) => key);
  if (disabledBadges.length > 0) {
    params.set('no_badges', disabledBadges.join(','));
  }

  // Extra emotes
  if (!settings.extraEmotes.bttv) params.set('bttv', 'false');
  if (!settings.extraEmotes.ffz) params.set('ffz', 'false');
  if (!settings.extraEmotes.sevenTv) params.set('7tv', 'false');
  if (!settings.extraEmotes.twitchGifs) params.set('gifs', 'false');

  // Notifications
  if (settings.notifications.enabled) {
    params.set('sound_notif', 'true');
    params.set('sound', settings.notifications.sound);
    params.set('vol', settings.notifications.volume.toString());
    params.set('threshold', settings.notifications.threshold.toString());
  }

  // Muted & Bad Words
  if (settings.mutedChatters.length > 0) {
    params.set('muted', settings.mutedChatters.join(','));
  }
  if (settings.customBadWords.length > 0) {
    params.set('badwords', settings.customBadWords.join(','));
  }

  params.set('overlay', 'true');
  return params;
}

// Parse settings from URL search params with fallback to saved or default settings
export function searchParamsToSettings(searchParams: URLSearchParams): ChatSettings {
  const saved = loadSettingsFromStorage() || DEFAULT_SETTINGS;

  const channel = searchParams.get('channel') || saved.channel;
  const style = searchParams.get('style') || saved.style || 'twitch';

  // Fade / Message hide
  const fadeParam = searchParams.get('fade');
  let alwaysShow = saved.message.alwaysShow;
  let hideSec = saved.message.hideAfterSeconds;
  if (fadeParam === 'false' || fadeParam === '0') {
    alwaysShow = true;
  } else if (fadeParam === 'true') {
    alwaysShow = false;
    hideSec = 15;
  } else if (fadeParam) {
    const parsed = parseInt(fadeParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      alwaysShow = false;
      hideSec = parsed;
    }
  }

  const delayParam = searchParams.get('delay');
  const chatDelay = delayParam ? parseInt(delayParam, 10) || 0 : saved.message.chatDelay;

  const animParam = searchParams.get('anim');
  const animationsEnabled = animParam !== null ? animParam !== 'false' : saved.message.animationsEnabled;

  // Font
  const fontFamily = searchParams.get('font_family') || saved.font.family;
  const fontColor = searchParams.get('font_color') || saved.font.color;
  const fontSize = parseInt(searchParams.get('font_size') || '', 10) || saved.font.size;

  // Flags
  const showPlatformIcon = searchParams.get('icons') === 'true' || (searchParams.get('icons') === null && saved.showPlatformIcon);
  const hideCommonBots = searchParams.get('hide_bots') !== 'false' && saved.hideCommonBots;
  const hideCommands = searchParams.get('hide_cmds') !== 'false' && saved.hideCommands;

  // Badges
  const noBadgesStr = searchParams.get('no_badges');
  const disabledBadges = noBadgesStr ? noBadgesStr.split(',') : [];
  const badges: BadgeFilters = {
    broadcaster: !disabledBadges.includes('broadcaster') && (saved.badges.broadcaster ?? true),
    moderator: !disabledBadges.includes('moderator') && (saved.badges.moderator ?? true),
    vip: !disabledBadges.includes('vip') && (saved.badges.vip ?? true),
    subscriber: !disabledBadges.includes('subscriber') && (saved.badges.subscriber ?? true),
    artist: !disabledBadges.includes('artist') && (saved.badges.artist ?? true),
    turbo: !disabledBadges.includes('turbo') && (saved.badges.turbo ?? true),
    prime: !disabledBadges.includes('prime') && (saved.badges.prime ?? true),
    bits: !disabledBadges.includes('bits') && (saved.badges.bits ?? true),
    subGifter: !disabledBadges.includes('subGifter') && (saved.badges.subGifter ?? true),
    twitchRewards: !disabledBadges.includes('twitchRewards') && (saved.badges.twitchRewards ?? false),
  };

  // Muted and Badwords
  const mutedParam = searchParams.get('muted');
  const mutedChatters = mutedParam ? mutedParam.split(',').map((s) => s.trim().toLowerCase()) : saved.mutedChatters;

  const badwordsParam = searchParams.get('badwords');
  const customBadWords = badwordsParam ? badwordsParam.split(',').map((s) => s.trim().toLowerCase()) : saved.customBadWords;

  // Sound
  const soundNotif = searchParams.get('sound_notif') === 'true' || (searchParams.get('sound_notif') === null && saved.notifications.enabled);
  const sound = searchParams.get('sound') || saved.notifications.sound;
  const vol = parseInt(searchParams.get('vol') || '', 10) || saved.notifications.volume;
  const threshold = parseInt(searchParams.get('threshold') || '', 10) || saved.notifications.threshold;

  return {
    ...saved,
    channel,
    style,
    badges,
    showPlatformIcon,
    hideCommonBots,
    hideCommands,
    mutedChatters,
    customBadWords,
    notifications: {
      enabled: soundNotif,
      sound,
      volume: vol,
      threshold,
    },
    font: {
      family: fontFamily,
      color: fontColor,
      size: fontSize,
    },
    message: {
      chatDelay,
      alwaysShow,
      hideAfterSeconds: hideSec,
      animationsEnabled,
    },
    fadeSeconds: alwaysShow ? 0 : hideSec,
  };
}
