# SuliChat 💬🎮

> **Suite libre y 100% de código abierto para streamers**, inspirada en [NightDev](https://nightdev.com/) y su widget clásico [KapChat](https://nightdev.com/kapchat).

![SuliChat Preview](https://img.shields.io/badge/Twitch-IRC%20WebSocket-9146FF?style=for-the-badge&logo=twitch&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

SuliChat permite a cualquier streamer conectar su chat de Twitch en vivo y generar una URL de **Browser Source para OBS Studio, Streamlabs o Twitch Studio** de forma instantánea, sin registro, sin backend y sin almacenar ningún dato.

---

## ⚡ Características Principales

- **Conexión Directa y Anónima**: Se conecta vía WebSocket directo a `wss://irc-ws.chat.twitch.tv:443` como usuario anónimo (*justinfan*). 0% backend necesario.
- **Renderizado de Emotes Nativos de Twitch**: Soporta emotes globales y de canal oficiales de Twitch automáticamente en alta resolución.
- **Insignias de Twitch (Badges)**: Soporte visual para Streamer/Broadcaster, Moderador, VIP, Suscriptor, Socio y Turbo/Prime.
- **Desvanecimiento de Mensajes (Fade Out)**: Opciones para ocultar mensajes automáticamente tras 10s, 20s, 30s (estilo KapChat) o mantenerlos siempre visibles.
- **Temas y Estilos**:
  - Oscuro / Transparente (óptimo para OBS)
  - Boxed (burbujas estilo tarjeta con desenfoque)
  - Claro
  - Minimalista
- **Sombreado de Alto Contraste (Text Stroke)**: Asegura que el chat sea perfectamente legible sobre cualquier videojuego o fondo en movimiento.
- **Simulador de Mensajes en Vivo**: Botón para probar la apariencia de tus mensajes, colores y emotes sin necesidad de tener un stream activo.
- **Modo Overlay Puro**: La URL generada para OBS (`?channel=tu_canal&overlay=true`) no contiene barras de navegación ni fondos, solo el chat limpio con fondo transparente.

---

## 🚀 Inicio Rápido (Desarrollo Local)

Requisitos: **Node.js 18+** y **npm** (o pnpm / yarn).

```bash
# 1. Clonar el repositorio
git clone https://github.com/svilla33/SuliChat.git
cd SuliChat

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🎥 Cómo Usar en OBS Studio / Streamlabs

1. Ingresa a SuliChat y escribe tu nombre de canal de Twitch (por ejemplo, `tu_canal`).
2. Ajusta las opciones a tu gusto (tamaño de fuente, tema, tiempo de desvanecimiento).
3. Copia el enlace generado en el apartado **3. URL para OBS Studio**.
4. En **OBS Studio**:
   - Agrega una nueva fuente `+` ➔ **Navegador (Browser)**.
   - Pega la URL en el campo **URL**.
   - Configura las dimensiones recomendadas:
     - **Ancho (Width)**: `450`
     - **Alto (Height)**: `650`
   - Asegúrate de dejar el fondo transparente.

---

## 🗺️ Hoja de Ruta (Hacia la suite tipo NightDev)

Este proyecto busca convertirse en una suite completa de herramientas abiertas para creadores de contenido:

- [x] **Paso 1**: Chat Overlay básico e instantáneo (KapChat clone).
- [ ] **Paso 2**: Soporte de emotes de terceros (7TV, BetterTTV y FrankerFaceZ) mediante sus APIs públicas.
- [ ] **Paso 3**: Filtro de palabras prohibidas o moderación personalizada en el overlay.
- [ ] **Paso 4**: Sonidos y alertas personalizadas para mensajes especiales o menciones.
- [ ] **Paso 5**: Módulos adicionales (Contador de subs/metas, alerta de seguidores, ruletas).

---

## 📄 Licencia

Distribuido bajo la licencia [MIT](LICENSE). Siéntete libre de modificarlo, bifurcarlo y adaptarlo a tus necesidades.
