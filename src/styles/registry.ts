export interface ChatStyle {
  id: string;
  name: string;
  description: string;
  cssUrl: string;
  jsUrl?: string;
}

export const REGISTERED_STYLES: ChatStyle[] = [
  {
    id: 'simple',
    name: 'Simple (NightDev KapChat)',
    description: 'Estilo original exacto de KapChat con fuente Helvetica Neue y diseño compacto.',
    cssUrl: '/chat-styles/simple/style.css',
    jsUrl: '/chat-styles/simple/script.js',
  },
  {
    id: 'custom1',
    name: 'Custom 1 (Burbujas Glass)',
    description: 'Estilo con fondo translúcido y bordes redondeados (public/chat-styles/custom1/).',
    cssUrl: '/chat-styles/custom1/style.css',
    jsUrl: '/chat-styles/custom1/script.js',
  },
  {
    id: 'custom2',
    name: 'Custom 2 (Outline Alto Contraste)',
    description: 'Texto con sombra oscura reforzada (public/chat-styles/custom2/).',
    cssUrl: '/chat-styles/custom2/style.css',
    jsUrl: '/chat-styles/custom2/script.js',
  },
];

export function getStyleConfig(styleId: string): ChatStyle {
  const cleanId = (styleId || 'simple').toLowerCase().trim();
  const found = REGISTERED_STYLES.find((s) => s.id === cleanId);
  if (found) return found;

  // Dynamically allow any user-created folder in public/chat-styles/<id>/
  return {
    id: cleanId,
    name: `Custom: ${cleanId}`,
    description: `Estilo personalizado cargado desde public/chat-styles/${cleanId}/`,
    cssUrl: `/chat-styles/${cleanId}/style.css`,
    jsUrl: `/chat-styles/${cleanId}/script.js`,
  };
}
