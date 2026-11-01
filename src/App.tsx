import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  Settings2,
  Tv,
  Sparkles,
  Palette,
  Info,
  Radio,
  Send,
  FolderOpen
} from 'lucide-react';
import { ChatOverlay } from './components/ChatOverlay';
import { DEFAULT_SETTINGS, type ChatSettings } from './types/settings';
import type { ChatMessage } from './services/twitchChat';
import { loadBadgesForChannel } from './services/twitchBadges';
import { REGISTERED_STYLES } from './styles/registry';

export const App: React.FC = () => {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isOverlayMode =
    searchParams.get('overlay') === 'true' ||
    searchParams.get('standalone') === 'true' ||
    window.location.pathname.includes('/obschat');

  // Initialize settings from URL params matching KapChat query format
  const [settings, setSettings] = useState<ChatSettings>(() => {
    const channelParam = searchParams.get('channel') || '';
    const styleParam = searchParams.get('style') || DEFAULT_SETTINGS.style;

    // Fade can be 'false', 'true', or a number like '30'
    const fadeParam = searchParams.get('fade');
    let fadeSec = DEFAULT_SETTINGS.fadeSeconds;
    if (fadeParam === 'true') fadeSec = 30;
    else if (fadeParam && fadeParam !== 'false') {
      const parsed = parseInt(fadeParam, 10);
      if (!isNaN(parsed)) fadeSec = parsed;
    }

    const botActivityParam = searchParams.get('bot_activity') === 'true';
    const preventClippingParam = searchParams.get('prevent_clipping') === 'true';
    const badgesParam = searchParams.get('badges') !== 'false';

    return {
      channel: channelParam,
      style: styleParam,
      fadeSeconds: fadeSec,
      botActivity: botActivityParam,
      preventClipping: preventClippingParam,
      showBadges: badgesParam,
    };
  });

  const [inputChannel, setInputChannel] = useState(settings.channel);
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [previewBg, setPreviewBg] = useState<'dark' | 'transparent' | 'white'>('dark');
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    loadBadgesForChannel(settings.channel);
  }, [settings.channel]);

  const sampleMessages: Array<{
    user: string;
    text: string;
    color: string;
    badges: Array<{ type: string; version: string }>;
    emotes: Array<{ id: string; start: number; end: number; name: string }>;
  }> = [
    {
      user: 'Carola',
      text: '¡Bienvenidos todos al stream! PogChamp',
      color: '#FF0000',
      badges: [{ type: 'broadcaster', version: '1' }, { type: 'partner', version: '1' }],
      emotes: [{ id: '88', start: 36, end: 43, name: 'PogChamp' }],
    },
    {
      user: 'ModMaster',
      text: 'Recuerden respetar las normas de la comunidad Kappa',
      color: '#10B981',
      badges: [{ type: 'moderator', version: '1' }],
      emotes: [{ id: '25', start: 47, end: 51, name: 'Kappa' }],
    },
    {
      user: 'SuperVIP',
      text: 'Probando el nuevo estilo de chat LUL',
      color: '#A855F7',
      badges: [{ type: 'vip', version: '1' }],
      emotes: [{ id: '425618', start: 33, end: 35, name: 'LUL' }],
    },
    {
      user: 'ViewerFiel',
      text: '¡El estilo KapChat idéntico a NightDev! VoHiYo',
      color: '#3B82F6',
      badges: [{ type: 'subscriber', version: '1' }, { type: 'premium', version: '1' }],
      emotes: [{ id: '81274', start: 41, end: 46, name: 'VoHiYo' }],
    },
  ];

  const handleSimulateMessage = () => {
    const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    const newMsg: ChatMessage = {
      id: `mock-${Date.now()}-${Math.random()}`,
      channel: settings.channel || 'demo',
      username: sample.user.toLowerCase(),
      displayName: sample.user,
      color: sample.color,
      badges: sample.badges,
      emotes: sample.emotes,
      text: sample.text,
      isAction: false,
      timestamp: Date.now(),
    };
    setMockMessages((prev) => [...prev.slice(-30), newMsg]);
  };

  // Generate exact KapChat style URL for OBS
  const generatedUrl = useMemo(() => {
    if (!settings.channel) return '';
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('channel', settings.channel);
    params.set('style', settings.style || 'simple');
    params.set('fade', settings.fadeSeconds > 0 ? settings.fadeSeconds.toString() : 'false');
    params.set('bot_activity', settings.botActivity ? 'true' : 'false');
    params.set('prevent_clipping', settings.preventClipping ? 'true' : 'false');
    params.set('overlay', 'true');

    return `${baseUrl}?${params.toString()}`;
  }, [settings]);

  const copyToClipboard = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputChannel.trim().toLowerCase().replace(/^#/, '');
    setSettings((prev) => ({ ...prev, channel: clean }));
  };

  // OBS Overlay Mode: render strictly the chat box with modular style loaded
  if (isOverlayMode) {
    return (
      <main className="w-screen h-screen bg-transparent overflow-hidden m-0 p-0">
        <ChatOverlay settings={settings} isStandalone={true} />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                SuliChat
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50">
                NightDev KapChat Modular
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Open Source Streamer Tools Suite
            </span>
            <a
              href="https://github.com/svilla33/SuliChat"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-900/40 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 rounded-2xl p-6 shadow-xl">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              NightDev KapChat Replicate & Style Studio
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Copia libre de KapChat con arquitectura modular para estilos. Crea carpetas en{' '}
              <code className="text-purple-300 font-mono text-xs bg-slate-950 px-1.5 py-0.5 rounded border border-purple-900/50">
                public/chat-styles/
              </code>{' '}
              con tu propio HTML, CSS y JS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs">
              <Radio
                className={`w-3.5 h-3.5 ${
                  connectionStatus === 'connected'
                    ? 'text-emerald-400 animate-pulse'
                    : connectionStatus === 'connecting'
                    ? 'text-amber-400 animate-spin'
                    : 'text-slate-500'
                }`}
              />
              <span className="capitalize text-slate-300">
                {connectionStatus === 'connected'
                  ? `Conectado a #${settings.channel}`
                  : connectionStatus === 'connecting'
                  ? 'Conectando...'
                  : settings.channel
                  ? 'Desconectado'
                  : 'Esperando canal'}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Columns: Generator on left, Live Style Preview on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Channel Input Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-purple-400" />
                1. Canal de Twitch
              </h2>
              <form onSubmit={handleApplyChannel} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    #
                  </span>
                  <input
                    type="text"
                    value={inputChannel}
                    onChange={(e) => setInputChannel(e.target.value)}
                    placeholder="Ejemplo: carola, ibai, shroud..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl pl-8 pr-4 py-2.5 text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                >
                  Conectar
                </button>
              </form>
            </div>

            {/* Chat Styles Modular Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  2. Estilos Modulares (Chat Styles)
                </h2>
                <span className="text-xs text-purple-400 font-mono flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5" />
                  public/chat-styles/
                </span>
              </div>

              {/* Style selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Estilo Seleccionado
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {REGISTERED_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, style: st.id }))}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        settings.style === st.id
                          ? 'border-purple-500 bg-purple-950/40 text-white shadow-md shadow-purple-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-200">{st.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                          {st.description}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-purple-400/80 mt-2">
                        chat-styles/{st.id}/
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced options matching KapChat parameters */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Desvanecer Mensajes (fade)
                  </label>
                  <select
                    value={settings.fadeSeconds}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        fadeSeconds: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500 text-sm"
                  >
                    <option value="0">false (Siempre visibles)</option>
                    <option value="30">true (30 segundos - KapChat defecto)</option>
                    <option value="15">15 segundos</option>
                    <option value="60">60 segundos</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2 sm:pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={settings.botActivity}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, botActivity: e.target.checked }))
                      }
                      className="accent-purple-600 w-4 h-4 rounded"
                    />
                    <span>bot_activity (Mostrar bots y comandos !)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={settings.preventClipping}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, preventClipping: e.target.checked }))
                      }
                      className="accent-purple-600 w-4 h-4 rounded"
                    />
                    <span>prevent_clipping (Evitar recorte al borde)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* OBS Link Generator */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                3. URL de KapChat para OBS Studio / Streamlabs
              </h2>

              {settings.channel ? (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedUrl}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-purple-300 font-mono outline-none select-all"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1.5 transition cursor-pointer ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Abrir en ventana independiente"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">
                        Cómo usar este estilo en OBS:
                      </span>
                      <p className="mt-1 text-slate-400">
                        Añade una fuente de <b>Navegador (Browser Source)</b> con la URL generada.
                        Tiene el DOM y las clases exactas de KapChat (
                        <code className="text-slate-300 font-mono">#chat_box</code>,{' '}
                        <code className="text-slate-300 font-mono">.chat_line</code>,{' '}
                        <code className="text-slate-300 font-mono">.nick</code>,{' '}
                        <code className="text-slate-300 font-mono">.message</code>).
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-slate-500 text-sm">
                  Introduce el canal arriba para generar la URL.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Style Preview Box (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                Vista Previa del Estilo ({settings.style})
              </span>

              <div className="flex items-center gap-2">
                {/* Background switcher for preview */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewBg('dark')}
                    title="Fondo Oscuro (Stream)"
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      previewBg === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400'
                    }`}
                  >
                    Oscuro
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('white')}
                    title="Fondo Blanco"
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      previewBg === 'white' ? 'bg-slate-200 text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Blanco
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('transparent')}
                    title="Fondo Transparente / Cuadrícula"
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      previewBg === 'transparent' ? 'bg-purple-900 text-purple-200' : 'text-slate-400'
                    }`}
                  >
                    Grid
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateMessage}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-purple-200 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  title="Generar mensaje de prueba"
                >
                  <Send className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            {/* Container where the style CSS is dynamically rendered */}
            <div
              className={`relative rounded-2xl border border-slate-800 shadow-2xl h-[520px] overflow-hidden flex flex-col transition-colors duration-200 ${
                previewBg === 'white'
                  ? 'bg-white'
                  : previewBg === 'dark'
                  ? 'bg-slate-950'
                  : 'bg-slate-900'
              }`}
            >
              {/* Optional grid pattern if transparent */}
              {previewBg === 'transparent' && (
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  }}
                />
              )}

              {settings.channel || mockMessages.length > 0 ? (
                <div className="relative w-full h-full p-2">
                  <ChatOverlay
                    settings={settings}
                    isStandalone={false}
                    onConnectionStatus={setConnectionStatus}
                    mockMessages={mockMessages}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-12 h-12 text-slate-700" />
                  <p className="text-sm font-medium">Ingresa un canal o pulsa "Test"</p>
                  <p className="text-xs text-slate-600 max-w-xs">
                    Renderiza el chat con el estilo activo{' '}
                    <code className="text-purple-400 font-mono">/chat-styles/{settings.style}/style.css</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SuliChat. Open-Source NightDev KapChat Replicate.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">DOM 100% compatible con KapChat CSS</span>
            <a
              href="https://github.com/svilla33/SuliChat"
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
