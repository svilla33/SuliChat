import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  ExternalLink,
  Check,
  Eye,
  EyeOff,
  Play,
  RefreshCw,
  Sliders,
  Type,
  ShieldAlert,
  Bell,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { ChatOverlay } from './components/ChatOverlay';
import {
  type ChatSettings,
  searchParamsToSettings,
  settingsToSearchParams,
  saveSettingsToStorage,
} from './types/settings';
import type { ChatMessage } from './services/twitchChat';
import { loadBadgesForChannel } from './services/twitchBadges';
import { loadExternalEmotesForChannel } from './services/externalEmotes';
import { useAvailableStyles } from './styles/registry';
import { AVAILABLE_SOUNDS, playNotificationSound } from './utils/audioNotification';

export const App: React.FC = () => {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isOverlayMode =
    searchParams.get('overlay') === 'true' ||
    searchParams.get('standalone') === 'true' ||
    window.location.pathname.includes('/obschat');

  // Load initial settings
  const [settings, setSettings] = useState<ChatSettings>(() => {
    return searchParamsToSettings(searchParams);
  });

  const availableStyles = useAvailableStyles();

  const [channelInput, setChannelInput] = useState(settings.channel);
  const [copied, setCopied] = useState(false);
  const [isUrlVisible, setIsUrlVisible] = useState(false);
  const [newBadWord, setNewBadWord] = useState('');
  const [previewBg, setPreviewBg] = useState(settings.previewBg || '#444f6f');
  const [, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    style: true,
    font: true,
    badges: false,
    emotes: false,
    messages: false,
    notifications: false,
  });

  const [mockMessages, setMockMessages] = useState<ChatMessage[]>([]);

  // Update channel badges & external emotes
  useEffect(() => {
    if (settings.channel) {
      loadBadgesForChannel(settings.channel);
      loadExternalEmotesForChannel(settings.channel);
    }
  }, [settings.channel]);

  // Set overlay class on body for OBS transparency
  useEffect(() => {
    if (isOverlayMode) {
      document.body.classList.add('overlay-mode');
    } else {
      document.body.classList.remove('overlay-mode');
    }
    return () => {
      document.body.classList.remove('overlay-mode');
    };
  }, [isOverlayMode]);

  // Sample messages for live preview
  const sampleUsers = [
    {
      user: 'SuliShade',
      color: '#3399cc',
      badges: [{ type: 'broadcaster', version: '1' }, { type: 'partner', version: '1' }],
      text: 'I love this chatbox! Welcome to the chat! PogChamp KEKW catJAM',
      emotes: [],
    },
    {
      user: 'ModMaster',
      color: '#10B981',
      badges: [{ type: 'moderator', version: '1' }],
      text: 'Remember to support Suli! peepoHappy PETPET AYAYA',
      emotes: [],
    },
    {
      user: 'GamerGiga',
      color: '#5cd0ff',
      badges: [{ type: 'subscriber', version: '12' }],
      text: 'Suli joined the game GIGACHAD EZ Clap',
      emotes: [],
    },
    {
      user: 'SuperFan99',
      color: '#EC4899',
      badges: [{ type: 'vip', version: '1' }],
      text: 'I love your stream! PepePls widepeepoHappy',
      emotes: [],
    },
    {
      user: 'CuriousPlayer',
      color: '#F59E0B',
      badges: [{ type: 'turbo', version: '1' }],
      text: 'Can I play with you??? monkaW HUH',
      emotes: [],
    },
    {
      user: 'TopDonator',
      color: '#9146FF',
      badges: [{ type: 'bits', version: '1000' }, { type: 'subscriber', version: '24' }],
      text: 'cheer100 Thank you for this great stream! POGGERS PepeLaugh',
      emotes: [],
    },
    {
      user: 'NoobChatter',
      color: '#06b6d4',
      badges: [{ type: 'prime', version: '1' }],
      text: 'How do you play Just Chatting? xdd NOWAY WAYTOODANK',
      emotes: [],
    },
    {
      user: 'FriendlyBot',
      color: '#a78bfa',
      badges: [{ type: 'artist', version: '1' }],
      text: 'Hello, I am a chat message! AlienDance monkaS pepeJAM',
      emotes: [],
    },
  ];

  // Automatically stream sample messages in loop until a Twitch channel is configured
  useEffect(() => {
    if (settings.channel && settings.channel.trim() !== '') {
      setMockMessages([]);
      return;
    }

    let currentIndex = 0;
    const sendNextSample = () => {
      const sample = sampleUsers[currentIndex % sampleUsers.length];
      currentIndex++;
      const newMsg: ChatMessage = {
        id: `mock-${Date.now()}-${Math.random()}`,
        channel: 'demo',
        username: sample.user.toLowerCase(),
        displayName: sample.user,
        color: sample.color,
        badges: sample.badges,
        emotes: sample.emotes,
        text: sample.text,
        isAction: false,
        timestamp: Date.now(),
      };
      setMockMessages((prev) => [...prev.slice(-20), newMsg]);
    };

    sendNextSample();
    const interval = setInterval(sendNextSample, 3400);

    return () => clearInterval(interval);
  }, [settings.channel]);

  // Generate URL for OBS Browser Source
  const generatedUrl = useMemo(() => {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const params = settingsToSearchParams(settings);
    return `${baseUrl}?${params.toString()}`;
  }, [settings]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = channelInput.trim().toLowerCase().replace(/^#/, '');
    setSettings((prev) => ({ ...prev, channel: clean }));
  };

  // Auto-save settings to local storage whenever changed
  useEffect(() => {
    saveSettingsToStorage({ ...settings, previewBg });
  }, [settings, previewBg]);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddBadWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newBadWord.trim().toLowerCase();
    if (word && !settings.customBadWords.includes(word)) {
      setSettings((prev) => ({
        ...prev,
        customBadWords: [...prev.customBadWords, word],
      }));
      setNewBadWord('');
    }
  };

  const handleRemoveBadWord = (wordToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      customBadWords: prev.customBadWords.filter((w) => w !== wordToRemove),
    }));
  };

  // Standalone Overlay Mode for OBS
  if (isOverlayMode) {
    return (
      <main className="w-screen h-screen bg-transparent overflow-hidden m-0 p-0 select-none">
        <ChatOverlay settings={settings} isStandalone={true} />
      </main>
    );
  }

  return (
    <div className="min-h-screen text-[#dce4ed] flex flex-col font-sans selection:bg-[#3399cc]/30 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-[#242c3a] bg-[#141720] sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/img/suli_sit.gif" alt="Suli" className="w-6 h-6 object-contain" />
            <span className="font-bold text-base text-white font-['Verdana',sans-serif]">
              SuliChat
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href="https://ko-fi.com/G6T529WGWF"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center hover:opacity-90 transition-opacity"
            >
              <img
                src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
                alt="Buy Me a Coffee at ko-fi.com"
                style={{ border: '0px', height: '28px' }}
                className="h-[28px] object-contain"
              />
            </a>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="max-w-[1240px] w-full mx-auto px-4 py-3 flex-1 space-y-2.5">
        {/* Quick Setup: Channel & Widget URL */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Channel */}
          <div className="md:col-span-5 bg-[#1b202a] border border-[#252e3c] rounded-[5px] p-2.5 flex flex-col justify-between">
            <form onSubmit={handleApplyChannel} className="flex gap-1.5">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1.5 text-[#3399cc] font-bold text-xs">#</span>
                <input
                  type="text"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  placeholder="channel_name"
                  className="w-full bg-[#13171f] border border-[#283240] focus:border-[#5cd0ff] rounded-[4px] text-white pl-6 pr-2 py-1 text-xs font-mono outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-[#242b36] hover:bg-[#2d3746] text-[#5cd0ff] border border-[#3399cc]/40 font-semibold px-2.5 py-1 rounded-[4px] text-xs transition cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Connect</span>
              </button>
            </form>
          </div>

          {/* Widget URL */}
          <div className="md:col-span-7 bg-[#1b202a] border border-[#252e3c] rounded-[5px] p-2.5 flex flex-col justify-between">

            <div className="flex gap-1.5">
              <div className="relative flex-1 bg-[#13171f] border border-[#283240] rounded-[4px] flex items-center overflow-hidden">
                <input
                  type={isUrlVisible ? 'text' : 'password'}
                  readOnly
                  value={generatedUrl}
                  className={`w-full bg-transparent px-2.5 py-1 text-xs text-[#5cd0ff] font-mono outline-none select-all ${
                    !isUrlVisible ? 'filter blur-[3.5px] select-none pointer-events-none' : ''
                  }`}
                />

                {!isUrlVisible && (
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="absolute inset-0 bg-[#13171f]/95 hover:bg-[#13171f] text-[#dce4ed] font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? (
                      <span className="text-[#5cd0ff] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Copied!
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#3399cc]" />
                        <span>Click to Copy URL</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsUrlVisible(!isUrlVisible)}
                  className="z-10 px-2 py-1 text-[#8c9cb4] hover:text-white border-l border-[#283240] bg-[#161a22]"
                  title={isUrlVisible ? 'Hide URL' : 'Show URL'}
                >
                  {isUrlVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>

              <button
                type="button"
                onClick={copyToClipboard}
                className="bg-[#5cd0ff] hover:bg-[#78deff] text-[#0f1722] font-semibold text-xs px-3 py-1 rounded-[4px] transition cursor-pointer flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <a
                href={generatedUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#242b36] hover:bg-[#2d3746] text-[#dce4ed] border border-[#283240] px-2 py-1 rounded-[4px] flex items-center justify-center transition"
                title="Open in new window"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 2-Column Settings & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
          {/* Settings Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            {/* Theme */}
            <div className="bg-[#1b202a] border border-[#252e3c] rounded-[5px] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('style')}
                className="w-full py-1.5 px-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#222936] transition"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#5cd0ff]" />
                  <span className="font-bold text-xs text-white">Theme</span>
                </div>
              </button>

              {openAccordions.style && (
                <div className="p-2.5 pt-0 border-t border-[#252e3c]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 pt-1.5">
                    {availableStyles.map((st) => {
                      const isSelected = settings.style === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSettings((prev) => ({ ...prev, style: st.id }))}
                          className={`px-2 py-1.5 rounded-[4px] border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#5cd0ff] border-[#5cd0ff] text-[#0f1722] font-bold'
                              : 'bg-[#161a22] border-[#283240] hover:bg-[#222936] text-[#dce4ed] font-medium'
                          }`}
                        >
                          <span className="text-xs truncate">{st.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#0f1722] shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Typography */}
            <div className="bg-[#1b202a] border border-[#252e3c] rounded-[5px] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('font')}
                className="w-full py-1.5 px-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#222936] transition"
              >
                <div className="flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-[#5cd0ff]" />
                  <span className="font-bold text-xs text-white">Typography</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#5cd0ff]">
                    {settings.font.family} • {settings.font.size}px
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8c9cb4] transition-transform ${
                      openAccordions.font ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {openAccordions.font && (
                <div className="p-2.5 pt-0 border-t border-[#252e3c] space-y-2.5">
                  {/* Font Family */}
                  <div className="pt-1.5 space-y-1">
                    <label className="text-[11px] font-bold text-[#8c9cb4] block">Font Family</label>
                    <select
                      value={settings.font.family}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          font: { ...prev.font, family: e.target.value },
                        }))
                      }
                      className="w-full bg-[#13171f] border border-[#283240] focus:border-[#5cd0ff] rounded-[4px] text-white text-xs px-2 py-1 outline-none cursor-pointer"
                    >
                      <optgroup label="Google Fonts">
                        <option value="Open Sans">Open Sans</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Outfit">Outfit</option>
                        <option value="Bebas Neue">Bebas Neue</option>
                        <option value="Oswald">Oswald</option>
                        <option value="Rubik">Rubik</option>
                        <option value="Nunito">Nunito</option>
                        <option value="Raleway">Raleway</option>
                        <option value="Ubuntu">Ubuntu</option>
                      </optgroup>
                      <optgroup label="System Fonts">
                        <option value="Arial">Arial</option>
                        <option value="Impact">Impact</option>
                        <option value="Arial Black">Arial Black</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Courier New">Courier New</option>
                      </optgroup>
                      <optgroup label="Pixel Fonts">
                        <option value="Press Start 2P">Press Start 2P</option>
                        <option value="Pixelify Sans">Pixelify Sans</option>
                        <option value="Silkscreen">Silkscreen</option>
                        <option value="VT323">VT323</option>
                        <option value="DotGothic16">DotGothic16</option>
                        <option value="Tiny5">Tiny5</option>
                        <option value="Jersey 10">Jersey 10</option>
                        <option value="Jersey 15">Jersey 15</option>
                        <option value="Jersey 25">Jersey 25</option>
                        <option value="Micro 5">Micro 5</option>
                        <option value="Jacquard 12">Jacquard 12</option>
                        <option value="Rubik Glitch">Rubik Glitch</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Size */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[11px] font-bold text-[#8c9cb4]">Font Size</span>
                      <span className="text-[#5cd0ff] font-mono font-bold">{settings.font.size}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="64"
                      value={settings.font.size}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          font: { ...prev.font, size: parseInt(e.target.value, 10) },
                        }))
                      }
                      className="clean-slider"
                    />
                  </div>

                  {/* Color */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#8c9cb4] block">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.font.color}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            font: { ...prev.font, color: e.target.value },
                          }))
                        }
                        className="w-6 h-6 rounded-[3px] border border-[#283240] bg-transparent cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={settings.font.color}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            font: { ...prev.font, color: e.target.value },
                          }))
                        }
                        className="bg-[#13171f] border border-[#283240] focus:border-[#5cd0ff] rounded-[4px] text-xs text-white font-mono px-2 py-0.5 w-24 outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="bg-[#1b202a] border border-[#252e3c] rounded-[5px] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('badges')}
                className="w-full py-1.5 px-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#222936] transition"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#5cd0ff]" />
                  <span className="font-bold text-xs text-white">Badges</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8c9cb4] transition-transform ${
                    openAccordions.badges ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openAccordions.badges && (
                <div className="p-2.5 pt-0 border-t border-[#252e3c] space-y-2">
                  {/* Twitch Rewards Filter */}
                  <div className="pt-1.5">
                    <label className="flex items-center justify-between p-1.5 rounded-[4px] bg-[#13171f] border border-[#283240] cursor-pointer select-none">
                      <span className="text-xs font-medium text-[#dce4ed]">
                        Hide Twitch event / drop badges
                      </span>
                      <input
                        type="checkbox"
                        checked={!settings.badges.twitchRewards}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            badges: {
                              ...prev.badges,
                              twitchRewards: !e.target.checked,
                            },
                          }))
                        }
                        className="w-3.5 h-3.5 rounded-[3px] accent-[#5cd0ff]"
                      />
                    </label>
                  </div>

                  {/* Individual Roles */}
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { key: 'broadcaster', label: 'Broadcaster' },
                      { key: 'moderator', label: 'Moderator' },
                      { key: 'vip', label: 'VIP' },
                      { key: 'subscriber', label: 'Subscriber' },
                      { key: 'artist', label: 'Artist' },
                      { key: 'turbo', label: 'Turbo' },
                      { key: 'prime', label: 'Prime' },
                      { key: 'bits', label: 'Bits' },
                      { key: 'subGifter', label: 'Sub Gifter' },
                    ].map(({ key, label }) => {
                      const enabled = settings.badges[key as keyof typeof settings.badges] ?? true;
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-1.5 p-1.5 rounded-[4px] border text-xs cursor-pointer select-none transition ${
                            enabled
                              ? 'bg-[#161a22] border-[#3399cc]/40 text-white'
                              : 'bg-[#12151c] border-[#222834] text-[#6b7b96]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                badges: {
                                  ...prev.badges,
                                  [key]: e.target.checked,
                                },
                              }))
                            }
                            className="w-3 h-3 rounded-[2px] accent-[#5cd0ff]"
                          />
                          <span className="truncate">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Emotes */}
            <div className="bg-[#1b202a] border border-[#252e3c] rounded-[5px] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('emotes')}
                className="w-full py-1.5 px-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#222936] transition"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#5cd0ff]" />
                  <span className="font-bold text-xs text-white">Emotes</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8c9cb4] transition-transform ${
                    openAccordions.emotes ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openAccordions.emotes && (
                <div className="p-2.5 pt-0 border-t border-[#252e3c]">
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                    {[
                      { key: 'sevenTv', label: '7TV Emotes' },
                      { key: 'bttv', label: 'BetterTTV Emotes' },
                      { key: 'ffz', label: 'FrankerFaceZ Emotes' },
                      { key: 'twitchGifs', label: 'Twitch GIFs' },
                    ].map(({ key, label }) => {
                      const enabled = settings.extraEmotes[key as keyof typeof settings.extraEmotes];
                      return (
                        <div
                          key={key}
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              extraEmotes: {
                                ...prev.extraEmotes,
                                [key]: !enabled,
                              },
                            }))
                          }
                          className="flex items-center justify-between p-1.5 rounded-[4px] bg-[#13171f] border border-[#283240] cursor-pointer select-none"
                        >
                          <span className="text-xs text-[#dce4ed]">{label}</span>
                          <div
                            className={`relative w-7 h-3.5 rounded-full border transition-colors ${
                              enabled ? 'bg-[#223547] border-[#3399cc]/60' : 'bg-[#1b2029] border-[#2b3340]'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full transition-transform ${
                                enabled ? 'translate-x-3.5 bg-[#5cd0ff]' : 'translate-x-0 bg-[#6b7b96]'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-[#1b202a] border border-[#252e3c] rounded-[5px] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('messages')}
                className="w-full py-1.5 px-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#222936] transition"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[#5cd0ff]" />
                  <span className="font-bold text-xs text-white">Messages & Delay</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8c9cb4] transition-transform ${
                    openAccordions.messages ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openAccordions.messages && (
                <div className="p-2.5 pt-0 border-t border-[#252e3c] space-y-2">
                  {/* Fade */}
                  <div className="pt-1.5 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-white select-none">
                      <input
                        type="checkbox"
                        checked={settings.message.alwaysShow}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            message: { ...prev.message, alwaysShow: e.target.checked },
                          }))
                        }
                        className="w-3.5 h-3.5 rounded-[2px] accent-[#5cd0ff]"
                      />
                      <span>Always show messages (no auto fade)</span>
                    </label>

                    {!settings.message.alwaysShow && (
                      <div className="space-y-1 pl-5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#8c9cb4]">Fade after:</span>
                          <span className="text-[#5cd0ff] font-mono font-bold">
                            {settings.message.hideAfterSeconds}s
                          </span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="120"
                          value={settings.message.hideAfterSeconds}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              message: {
                                ...prev.message,
                                hideAfterSeconds: parseInt(e.target.value, 10),
                              },
                            }))
                          }
                          className="clean-slider"
                        />
                      </div>
                    )}
                  </div>

                  {/* Delay */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8c9cb4]">Chat delay:</span>
                      <span className="text-[#5cd0ff] font-mono font-bold">
                        {settings.message.chatDelay}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={settings.message.chatDelay}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          message: {
                            ...prev.message,
                            chatDelay: parseInt(e.target.value, 10),
                          },
                        }))
                      }
                      className="clean-slider"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#252e3c]">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none text-[#dce4ed]">
                      <input
                        type="checkbox"
                        checked={settings.showPlatformIcon}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, showPlatformIcon: e.target.checked }))
                        }
                        className="w-3 h-3 rounded-[2px] accent-[#5cd0ff]"
                      />
                      <span>Twitch icon</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none text-[#dce4ed]">
                      <input
                        type="checkbox"
                        checked={settings.message.animationsEnabled}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            message: { ...prev.message, animationsEnabled: e.target.checked },
                          }))
                        }
                        className="w-3 h-3 rounded-[2px] accent-[#5cd0ff]"
                      />
                      <span>Animations</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none text-[#dce4ed]">
                      <input
                        type="checkbox"
                        checked={settings.hideCommonBots}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, hideCommonBots: e.target.checked }))
                        }
                        className="w-3 h-3 rounded-[2px] accent-[#5cd0ff]"
                      />
                      <span>Hide bots</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none text-[#dce4ed]">
                      <input
                        type="checkbox"
                        checked={settings.hideCommands}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, hideCommands: e.target.checked }))
                        }
                        className="w-3 h-3 rounded-[2px] accent-[#5cd0ff]"
                      />
                      <span>Hide '!' commands</span>
                    </label>
                  </div>

                  {/* Bad words */}
                  <div className="space-y-1 pt-1.5 border-t border-[#252e3c]">
                    <label className="text-[11px] font-bold text-[#8c9cb4] block">Censored Words</label>
                    <form onSubmit={handleAddBadWord} className="flex gap-1.5">
                      <input
                        type="text"
                        value={newBadWord}
                        onChange={(e) => setNewBadWord(e.target.value)}
                        placeholder="word to block"
                        className="flex-1 bg-[#13171f] border border-[#283240] rounded-[4px] text-white px-2 py-0.5 text-xs font-mono outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[#242b36] hover:bg-[#2d3746] text-[#5cd0ff] border border-[#3399cc]/40 px-2.5 py-0.5 rounded-[4px] text-xs font-bold transition cursor-pointer"
                      >
                        Add
                      </button>
                    </form>

                    {settings.customBadWords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {settings.customBadWords.map((w) => (
                          <span
                            key={w}
                            className="inline-flex items-center gap-1 bg-[#13171f] border border-[#283240] rounded-[3px] text-xs px-1.5 py-0.5 text-[#dce4ed]"
                          >
                            <span>{w}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBadWord(w)}
                              className="text-red-400 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Audio Alerts */}
            <div className="bg-[#1b202a] border border-[#252e3c] rounded-[5px] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('notifications')}
                className="w-full py-1.5 px-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#222936] transition"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#5cd0ff]" />
                  <span className="font-bold text-xs text-white">Audio Alerts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] border ${
                      settings.notifications.enabled
                        ? 'bg-[#223547] text-[#5cd0ff] border-[#3399cc]/60'
                        : 'bg-[#181c24] text-[#6b7b96] border-[#252e3c]'
                    }`}
                  >
                    {settings.notifications.enabled ? 'ON' : 'OFF'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8c9cb4] transition-transform ${
                      openAccordions.notifications ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {openAccordions.notifications && (
                <div className="p-2.5 pt-0 border-t border-[#252e3c] space-y-2">
                  <div
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          enabled: !prev.notifications.enabled,
                        },
                      }))
                    }
                    className="pt-1.5 flex items-center justify-between p-1.5 rounded-[4px] bg-[#13171f] border border-[#283240] cursor-pointer select-none"
                  >
                    <span className="text-xs font-medium text-[#dce4ed]">Play sound on new message</span>
                    <div
                      className={`relative w-7 h-3.5 rounded-full border transition-colors ${
                        settings.notifications.enabled ? 'bg-[#223547] border-[#3399cc]/60' : 'bg-[#1b2029] border-[#2b3340]'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full transition-transform ${
                          settings.notifications.enabled ? 'translate-x-3.5 bg-[#5cd0ff]' : 'translate-x-0 bg-[#6b7b96]'
                        }`}
                      />
                    </div>
                  </div>

                  {settings.notifications.enabled && (
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        <select
                          value={settings.notifications.sound}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                sound: e.target.value,
                              },
                            }))
                          }
                          className="flex-1 bg-[#13171f] border border-[#283240] rounded-[4px] text-white text-xs px-2 py-1 outline-none cursor-pointer"
                        >
                          {AVAILABLE_SOUNDS.map((snd) => (
                            <option key={snd.id} value={snd.id}>
                              {snd.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            playNotificationSound(
                              settings.notifications.sound,
                              settings.notifications.volume
                            )
                          }
                          className="bg-[#242b36] hover:bg-[#2d3746] text-[#5cd0ff] border border-[#3399cc]/40 px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Test</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[11px] text-[#8c9cb4]">Volume:</span>
                          <span className="text-[#5cd0ff] font-mono font-bold">
                            {settings.notifications.volume}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={settings.notifications.volume}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                volume: parseInt(e.target.value, 10),
                              },
                            }))
                          }
                          className="clean-slider"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            {/* Stream Scene Preview Card */}
            <div className="bg-[#1b202a] border border-[#252e3c] rounded-[5px] overflow-hidden">
              {/* Chat Canvas Frame */}
              <div
                className="w-full h-[440px] relative overflow-hidden transition-colors"
                style={{
                  backgroundColor: previewBg === 'grid' ? 'transparent' : previewBg,
                  backgroundImage:
                    previewBg === 'grid'
                      ? 'linear-gradient(45deg, #181c24 25%, transparent 25%), linear-gradient(-45deg, #181c24 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181c24 75%), linear-gradient(-45deg, transparent 75%, #181c24 75%)'
                      : undefined,
                  backgroundSize: previewBg === 'grid' ? '16px 16px' : undefined,
                  backgroundPosition:
                    previewBg === 'grid' ? '0 0, 0 8px, 8px -8px, -8px 0px' : undefined,
                }}
              >
                <div className="w-full h-full relative">
                  <ChatOverlay
                    settings={settings}
                    isStandalone={false}
                    onConnectionStatus={setConnectionStatus}
                    mockMessages={mockMessages}
                  />
                </div>
              </div>

              {/* Controls Toolbar */}
              <div className="p-2 bg-[#141720] border-t border-[#252e3c]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#8c9cb4] font-medium">Background:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewBg('grid')}
                      className={`px-2 py-0.5 rounded-[3px] text-[11px] font-medium border transition cursor-pointer ${
                        previewBg === 'grid'
                          ? 'bg-[#5cd0ff] text-[#0f1722] border-[#5cd0ff] font-bold'
                          : 'bg-[#1b202a] text-[#dce4ed] border-[#2b3544]'
                      }`}
                    >
                      Transparent
                    </button>
                    <input
                      type="color"
                      value={previewBg === 'grid' ? '#000000' : previewBg}
                      onChange={(e) => setPreviewBg(e.target.value)}
                      className="w-5 h-5 rounded-[3px] border border-[#2b3544] bg-transparent cursor-pointer p-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Static Footer at the bottom */}
      <footer className="mt-auto border-t border-[#242c3a] bg-[#141720] py-2 px-4">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4 text-xs text-[#8c9cb4]">
          <div className="flex items-center gap-2">
            <span>Settings apply live to your OBS Browser Source.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
