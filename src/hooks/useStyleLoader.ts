import { useEffect } from 'react';
import { getStyleConfig } from '../styles/registry';

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
    link.href = config.cssUrl;

    // 2. Inject JS script if provided
    let script = document.getElementById('sulichat-style-script') as HTMLScriptElement | null;
    if (script) {
      script.remove();
    }

    if (config.jsUrl) {
      const newScript = document.createElement('script');
      newScript.id = 'sulichat-style-script';
      newScript.src = config.jsUrl;
      newScript.async = true;
      document.body.appendChild(newScript);
    }

    return () => {
      // Keep style on unmount or cleanup if needed
    };
  }, [styleId]);
}
