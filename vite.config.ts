import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function chatStylesPlugin(): Plugin {
  const getStyles = () => {
    const stylesDir = path.resolve(process.cwd(), 'public/chat-styles');
    if (!fs.existsSync(stylesDir)) return [];

    const entries = fs.readdirSync(stylesDir, { withFileTypes: true });
    const styles = [];

    const themesJsonPath = path.resolve(process.cwd(), 'src/styles/themes.json');
    let KNOWN_METADATA: Record<string, { name: string; description: string }> = {};
    try {
      if (fs.existsSync(themesJsonPath)) {
        KNOWN_METADATA = JSON.parse(fs.readFileSync(themesJsonPath, 'utf-8'));
      }
    } catch (e) {
      console.warn('Could not read themes.json:', e);
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const styleCss = path.join(stylesDir, entry.name, 'style.css');
        if (fs.existsSync(styleCss)) {
          const id = entry.name.toLowerCase();
          const hasScript = fs.existsSync(path.join(stylesDir, entry.name, 'script.js'));
          const meta = KNOWN_METADATA[id];
          styles.push({
            id,
            name: meta?.name || id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, ' '),
            description: meta?.description || `Estilo cargado desde public/chat-styles/${id}/`,
            cssUrl: `chat-styles/${entry.name}/style.css`,
            jsUrl: hasScript ? `chat-styles/${entry.name}/script.js` : undefined,
            isCustom: !meta,
          });
        }
      }
    }

    const priority = Object.keys(KNOWN_METADATA);
    return styles.sort((a, b) => {
      const idxA = priority.indexOf(a.id);
      const idxB = priority.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  return {
    name: 'sulichat-styles-plugin',
    configureServer(server) {
      server.middlewares.use('/api/styles', (_req, res) => {
        const styles = getStyles();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.end(JSON.stringify(styles));
      });

      const notifyChange = (fileOrDir: string) => {
        if (fileOrDir.includes('chat-styles') || fileOrDir.includes('themes.json')) {
          server.ws.send({ type: 'custom', event: 'sulichat:styles-changed' });
        }
      };

      server.watcher.on('add', notifyChange);
      server.watcher.on('unlink', notifyChange);
      server.watcher.on('addDir', notifyChange);
      server.watcher.on('unlinkDir', notifyChange);
    },
    buildStart() {
      const styles = getStyles();
      const manifestPath = path.resolve(process.cwd(), 'public/chat-styles/manifest.json');
      fs.writeFileSync(manifestPath, JSON.stringify(styles, null, 2));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), chatStylesPlugin()],
});
