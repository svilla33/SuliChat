import { useEffect } from 'react';
import { getStyleConfig } from '../styles/registry';

function resolveUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const clean = url.replace(/^\.?\//, '');
  return `${base}${clean}`;
}

export function useStyleLoader(styleId: string) {
  useEffect(() => {
    const config = getStyleConfig(styleId);

    // 1. Inject or update CSS stylesheet link
    let link = document.getElementById('sulichat-style-link') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'sulichat-style-link';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const resolvedCss = resolveUrl(config.cssUrl);
    if (resolvedCss) {
      link.href = resolvedCss;
    }

    // 2. Inject JS script if provided
    let script = document.getElementById('sulichat-style-script') as HTMLScriptElement | null;
    if (script) {
      script.remove();
    }

    const resolvedJs = resolveUrl(config.jsUrl);
    if (resolvedJs) {
      const newScript = document.createElement('script');
      newScript.id = 'sulichat-style-script';
      newScript.src = resolvedJs;
      newScript.async = true;
      document.body.appendChild(newScript);
    }

    return () => {
      // Keep style on unmount or cleanup if needed
    };
  }, [styleId]);
}
