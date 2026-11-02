# SuliChat 💬🎮 ★ Suli Shade

> **Twitch Chat Box Overlay & Customization Suite 100% Open Source**, con panel de control GTK/Widget Factory limpio y plano, renderizador de emotes en tiempo real (Twitch, 7TV y BetterTTV), tipografías pixeladas y compatibilidad total con OBS Studio y Streamlabs Desktop.

![Twitch](https://img.shields.io/badge/Twitch-IRC%20WebSocket-9146FF?style=for-the-badge&logo=twitch&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## ✨ Características Principales

- **🎮 Interfaz Compacta GTK Widget Factory**: Look plano, profesional, sin degradados invasivos, con márgenes y paddings optimizados para máxima ergonomía visual.
- **⚡ Simulación Automática en Vivo**: Mensajes demo en inglés generados dinámicamente con emotes variados de 7TV y BTTV que se reproducen de inmediato hasta que ingresas tu canal de Twitch.
- **👾 12 Fuentes Pixeladas de Google Fonts**: Sección dedicada con *Press Start 2P*, *Silkscreen*, *Pixelify Sans*, *VT323*, *Chakra Petch*, *Jacquard 12*, *Tiny5*, y más.
- **😀 Soporte Completo de Emotes**:
  - Emotes oficiales de Twitch (estáticos y animados).
  - Emotes de canal y globales de **7TV** y **BetterTTV (BTTV)** con WebP y fallback dinámico garantizado.
- **🎵 Alertas Sonoras Sintetizadas**: Reproducción sin retardos mediante Web Audio API (efectos de 8-bit, arpegios, campanadas y monedas). Sin fallos de carga ni problemas de CORS.
- **📦 Modularidad Total (`themes.json`)**: Agrega o personaliza estilos de chat simplemente colocando carpetas en `public/chat-styles/<nombre>/`.
- **🎥 Diseñado para OBS Studio**: Soporta modo overlay puro transparente sin barra de navegación ni controles (`overlay=true`).

---

## 🎨 Temas Incluidos

- **Twitch**: Estilo clásico de chat de Twitch con colores originales.
- **Boxed**: Cada mensaje dentro de una elegante burbuja translúcida.
- **Chunky**: Estilo arcade de alto contraste con bordes marcados.
- **Clean**: Diseño minimalista ultra limpio sin dos puntos para máxima legibilidad.
- **Old School**: Estilo vintage retro tipo IRC con tipografía monoespaciada.
- **Text Chat**: Modo burbuja de mensajería instantánea compacta.

---

## ⚙️ Opciones del Panel

1. **Plataformas e Insignias**:
   - Conexión directa a cualquier canal de Twitch por WebSocket IRC.
   - Filtros de insignias: Moderador, Suscriptor, Turbo, Prime Gaming, Bits, Sub Gifter.
2. **Iconos y Emotes**:
   - Interruptor para mostrar insignia de Twitch.
   - Detección automática y renderizado de emotes de 7TV y BTTV.
3. **Filtros de Chat y Moderación**:
   - Ocultar bots comunes de chat (Nightbot, StreamElements, etc.).
   - Ocultar comandos que inicien con `!`.
   - Lista negra de usuarios silenciados (Muted Chatters).
   - Filtro de palabras prohibidas (Custom Bad Words).
4. **Notificaciones de Sonido**:
   - 5 sonidos sintetizados en tiempo real.
   - Selector de volumen y umbral de activación (trigger threshold).
   - Botón de prueba instantánea.
5. **Tipografía y Mensajes**:
   - Fuentes estándar (Inter, Roboto, Montserrat, Arial, Courier New, Impact, etc.).
   - Sección dedicada de **Fuentes Pixeladas** de Google Fonts.
   - Color de texto con selector hexadecimal y visualizador de color.
   - Tamaño de fuente (12px a 64px).
   - Retardo de chat y tiempo de desvanecimiento con soporte para mensajes siempre visibles.

---

## ⚡ Configuración en OBS Studio

1. Abre **OBS Studio** y añade una nueva fuente: **Navegador (Browser Source)**.
2. Marca la casilla **Controlar el audio a través de OBS** (opcional, si usas alertas de sonido).
3. Pega la URL del widget generada en el panel (o usa los parámetros por URL).
4. Ajusta las dimensiones recomendadas (ejemplo: **Ancho:** `450`, **Alto:** `700`).

### Parámetros de URL soportados

| Parámetro | Ejemplo | Descripción |
| :--- | :--- | :--- |
| `channel` | `suli` | Nombre de usuario de Twitch al que conectar. |
| `style` | `twitch` | Tema activo (`twitch`, `clean`, `boxed`, `chunky`, `old-school`, `text-chat`). |
| `font_size` | `24` | Tamaño de fuente en píxeles. |
| `font_color` | `%23ffffff` | Color del texto (Hex codificado o estándar). |
| `fade` | `false` o `15` | Tiempo en segundos antes de desvanecer o `false` para no ocultar. |
| `delay` | `0` | Retardo en segundos antes de mostrar el mensaje. |
| `overlay` | `true` | Modo transparente puro para OBS (oculta el panel de ajustes). |

Ejemplo completo:
```text
https://svilla33.github.io/SuliChat/?channel=tu_canal&style=clean&font_size=22&overlay=true
```

---

## 🚀 Despliegue

### 1. GitHub Pages (Automático con GitHub Actions)

El repositorio incluye el flujo de trabajo en `.github/workflows/deploy.yml`:

1. Haz push de tus cambios a la rama `main` en GitHub:
   ```bash
   git push origin main
   ```
2. En tu repositorio de GitHub, ve a **Settings** > **Pages**.
3. En **Source**, selecciona **GitHub Actions**.
4. ¡Listo! La acción compilará y publicará la web automáticamente en `https://<tu-usuario>.github.io/SuliChat/`.

### 2. Vercel o Netlify

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor local
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación local
npm run preview
```

---

## 📄 Licencia

Distribuido bajo la licencia [MIT](LICENSE). Creado con cariño por [Suli Shade](https://ko-fi.com/sulishade).
