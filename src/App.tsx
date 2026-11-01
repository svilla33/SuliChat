import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  Settings2,
  Tv,
  Sparkles,
  Sliders,
  Info,
  Radio,
  Send
} from 'lucide-react';
import { ChatOverlay } from './components/ChatOverlay';
import { DEFAULT_SETTINGS, type ChatSettings, type ChatTheme } from './types/settings';
import type { ChatMessage } from './services/twitchChat';

export const App: React.FC = () => {
  // Query param parsing for OBS browser source mode
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isOverlayMode = searchParams.get('overlay') === 'true' || searchParams.get('standalone') === 'true';

  // State
  const [settings, setSettings] = useState<ChatSettings>(() => {
    const channelParam = searchParams.get('channel') || '';
    const themeParam = (searchParams.get('theme') as ChatTheme) || DEFAULT_SETTINGS.theme;
    const fontSizeParam = parseInt(searchParams.get('fontSize') || `${DEFAULT_SETTINGS.fontSize}`, 10);
    const fadeParam = parseInt(searchParams.get('fade') || `${DEFAULT_SETTINGS.fadeSeconds}`, 10);
    const badgesParam = searchParams.has('badges') ? searchParams.get('badges') === 'true' : DEFAULT_SETTINGS.showBadges;
    const strokeParam = searchParams.has('stroke') ? searchParams.get('stroke') === 'true' : DEFAULT_SETTINGS.strokeEffect;

    return {
      channel: channelParam,
      theme: themeParam,
      fontSize: isNaN(fontSizeParam) ? DEFAULT_SETTINGS.fontSize : fontSizeParam,
      fadeSeconds: isNaN(fadeParam) ? DEFAULT_SETTINGS.fadeSeconds : fadeParam,
      showBadges: badgesParam,
      strokeEffect: strokeParam,
      compactMode: false,
      soundAlert: false,
    };
  });

  const [inputChannel, setInputChannel] = useState(settings.channel);
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>([]);

  const sampleMessages: Array<{ user: string; text: string; color: string; badges: Array<{ type: string; version: string }>; emotes: Array<{ id: string; start: number; end: number; name: string }> }> = [
    {
      user: 'SuliDev',
      text: '¡Hola a todos! Bienvenidos al stream PogChamp',
      color: '#A855F7',
      badges: [{ type: 'broadcaster', version: '1' }],
      emotes: [{ id: '88', start: 39, end: 46, name: 'PogChamp' }],
    },
    {
      user: 'ModMaster',
      text: 'Recordad seguir las reglas del chat Kappa',
      color: '#10B981',
      badges: [{ type: 'moderator', version: '1' }],
      emotes: [{ id: '25', start: 36, end: 40, name: 'Kappa' }],
    },
    {
      user: 'SuperVIP',
      text: '¿A qué juego le damos hoy? LUL',
      color: '#EC4899',
      badges: [{ type: 'vip', version: '1' }],
      emotes: [{ id: '425618', start: 27, end: 29, name: 'LUL' }],
    },
    {
      user: 'ViewerFiel',
      text: '¡El mejor setup de overlay que he visto! VoHiYo',
      color: '#3B82F6',
      badges: [{ type: 'subscriber', version: '1' }],
      emotes: [{ id: '81274', start: 43, end: 48, name: 'VoHiYo' }],
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

  // Handle URL generation for OBS
  const generatedUrl = useMemo(() => {
    if (!settings.channel) return '';
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('channel', settings.channel);
    params.set('overlay', 'true');
    if (settings.theme !== DEFAULT_SETTINGS.theme) params.set('theme', settings.theme);
    if (settings.fontSize !== DEFAULT_SETTINGS.fontSize) params.set('fontSize', settings.fontSize.toString());
    if (settings.fadeSeconds !== DEFAULT_SETTINGS.fadeSeconds) params.set('fade', settings.fadeSeconds.toString());
    if (!settings.showBadges) params.set('badges', 'false');
    if (!settings.strokeEffect) params.set('stroke', 'false');

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

  // If in overlay mode (for OBS Browser Source), render strictly the chat widget without any app chrome
  if (isOverlayMode) {
    return (
      <main className="w-screen h-screen bg-transparent overflow-hidden">
        <ChatOverlay settings={settings} isStandalone={true} />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Top Navigation Bar */}
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
                v0.1.0 Beta
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Open Source Streamer Overlay Suite
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Hero banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-900/40 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 rounded-2xl p-6 shadow-xl">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Twitch Chat Overlay Widget
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Alternativa libre, ligera y 100% open-source a KapChat. Conexión directa a Twitch WebSocket IRC sin backend ni registros.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
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

        {/* 2-Columns Layout: Configurator & Live Chat Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Settings and OBS link (7 cols) */}
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
                    placeholder="Ejemplo: ibai, shroud, midudev..."
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
              <p className="text-xs text-slate-500">
                Pon tu nombre de usuario de Twitch y verás el chat aparecer en el visor al instante.
              </p>
            </div>

            {/* Customization Options */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                2. Personalización Visual
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Tema
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, theme: e.target.value as ChatTheme }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  >
                    <option value="dark">Oscuro / Transparente (Clásico)</option>
                    <option value="boxed">Boxed / Burbujas oscuras</option>
                    <option value="light">Claro</option>
                    <option value="minimal">Minimalista</option>
                  </select>
                </div>

                {/* Fade Out */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Desvanecer Mensajes
                  </label>
                  <select
                    value={settings.fadeSeconds}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, fadeSeconds: parseInt(e.target.value, 10) }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  >
                    <option value="0">Nunca (Siempre visibles)</option>
                    <option value="10">Tras 10 segundos</option>
                    <option value="20">Tras 20 segundos</option>
                    <option value="30">Tras 30 segundos (Estilo KapChat)</option>
                    <option value="60">Tras 60 segundos</option>
                  </select>
                </div>
              </div>

              {/* Font size slider */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Tamaño de Texto</span>
                  <span className="text-purple-400 font-bold">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={settings.fontSize}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={settings.showBadges}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, showBadges: e.target.checked }))
                    }
                    className="accent-purple-600 w-4 h-4 rounded"
                  />
                  <span>Mostrar Insignias (Mod, VIP, Sub, Streamer)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={settings.strokeEffect}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, strokeEffect: e.target.checked }))
                    }
                    className="accent-purple-600 w-4 h-4 rounded"
                  />
                  <span>Borde sombreado en texto (Alta legibilidad)</span>
                </label>
              </div>
            </div>

            {/* OBS Browser Source Generator Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                3. URL para OBS Studio / Streamlabs
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
                      <span className="font-semibold text-slate-200">Cómo agregarlo en OBS:</span>
                      <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-400">
                        <li>En OBS, añade una fuente de tipo <b>Navegador (Browser Source)</b>.</li>
                        <li>Pega la URL generada arriba en el campo <b>URL</b>.</li>
                        <li>Configura dimensiones sugeridas: <b>Ancho: 450</b>, <b>Alto: 650</b>.</li>
                        <li>¡Listo! El fondo es completamente transparente.</li>
                      </ol>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-slate-500 text-sm">
                  Introduce el nombre de tu canal arriba para generar tu URL de OBS.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Chat View Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                Vista Previa en Vivo
              </span>
              <button
                type="button"
                onClick={handleSimulateMessage}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-purple-200 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Generar mensaje de prueba"
              >
                <Send className="w-3 h-3" />
                <span>Simular Mensaje</span>
              </button>
            </div>

            {/* Preview Box Container with simulated stream backdrop */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl h-[520px] flex flex-col overflow-hidden">
              {/* Optional simulated gaming background checkerboard/gradient */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.15) 2%, transparent 0%)',
                  backgroundSize: '100px 100px',
                }}
              />

              {settings.channel || mockMessages.length > 0 ? (
                <ChatOverlay
                  settings={settings}
                  isStandalone={false}
                  onConnectionStatus={setConnectionStatus}
                  mockMessages={mockMessages}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-12 h-12 text-slate-700" />
                  <p className="text-sm font-medium">Ingresa un canal o pulsa "Simular Mensaje"</p>
                  <p className="text-xs text-slate-600 max-w-xs">
                    Se conectará al instante a los servidores IRC de Twitch y mostrará los mensajes, emotes e insignias.
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
          <p>© {new Date().getFullYear()} SuliChat. 100% Free & Open-Source (MIT License).</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Inspirado en KapChat / NightDev</span>
            <a
              href="https://github.com/svilla33/SuliChat"
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Contribuir en GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
