# SuliChat - Custom Chat Styles Guide 🎨

Este directorio contiene los temas y estilos modulares para el chat, estructurados exactamente con el DOM clásico de **NightDev KapChat**.

## 📁 Estructura de carpetas

```text
public/chat-styles/
├── simple/          # Estilo clásico idéntico a KapChat (por defecto)
│   ├── style.css
│   └── script.js    (opcional)
├── custom1/         # Estilo personalizado 1 (Boxed/Glassmorphism)
│   ├── style.css
│   └── script.js    (opcional)
└── custom2/         # Estilo personalizado 2 (Outline Alto Contraste)
    ├── style.css
    └── script.js    (opcional)
```

## 🚀 Cómo agregar un nuevo estilo

1. Crea una nueva carpeta dentro de `public/chat-styles/`, por ejemplo: `public/chat-styles/retro/`
2. Agrega tu archivo `style.css` (y opcionalmente `script.js`).
3. En la URL para OBS o en el navegador, simplemente usa el parámetro:
   ```
   ?channel=tu_canal&style=retro
   ```
   ¡SuliChat cargará automáticamente el CSS y JS de esa carpeta!

## 🧩 Clases CSS disponibles (Estándar KapChat)

Cualquier CSS de KapChat o plantilla existente en la comunidad funcionará de forma nativa:

- `#chat_box`: Contenedor principal de todos los mensajes.
- `.chat_line`: Cada fila de mensaje (`[data-id]`, `[data-nick]`, `[data-timestamp]`).
- `.time_stamp`: Marca temporal del mensaje (si está activa).
- `.badges`: Contenedor de insignias.
- `.tag`: Cada imagen de insignia individual (`.broadcaster-1`, `.moderator-1`, etc.).
- `.nick`: El nombre de usuario en Twitch (con el color del usuario en línea).
- `.colon`: Los dos puntos `:` separadores.
- `.message`: El texto del mensaje.
- `.emoticon`: Cada imagen de emote (`.ttv-emo-{id}`).
