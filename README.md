# SuliChat 💬🎮

> **Copia libre y 100% de código abierto de [NightDev KapChat](https://nightdev.com/kapchat)** con arquitectura modular de estilos CSS/JS en carpetas.

![Twitch](https://img.shields.io/badge/Twitch-IRC%20WebSocket-9146FF?style=for-the-badge&logo=twitch&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

SuliChat replica fielmente el widget original de KapChat (`https://nightdev.com/hosted/obschat`) respetando el mismo árbol DOM (`#chat_box`, `.chat_line`, `.nick`, `.message`, `.badges`, `.tag`, `.emoticon`), permitiendo compatibilidad total con cualquier tema CSS creado para KapChat.

---

## 🎨 Sistema Modular de Estilos (Chat Styles)

El proyecto está preparado para que puedas añadir, editar y probar estilos personalizados simplemente creando carpetas con archivos `style.css` y `script.js` opcionales:

```text
public/chat-styles/
├── simple/          # Estilo clásico idéntico a NightDev KapChat
│   ├── style.css
│   └── script.js
├── custom1/         # Plantilla personalizada 1 (Burbujas Glass)
│   ├── style.css
│   └── script.js
└── custom2/         # Plantilla personalizada 2 (Outline Alto Contraste)
    ├── style.css
    └── script.js
```

### ¿Cómo crear tu propio estilo?
1. Crea una carpeta dentro de `public/chat-styles/`, por ejemplo: `public/chat-styles/neon/`
2. Añade tu archivo `style.css` (y opcionalmente `script.js`).
3. En OBS o en el navegador, simplemente pásale el parámetro:
   ```text
   ?channel=tu_canal&style=neon
   ```
   ¡SuliChat inyectará dinámicamente tu CSS y JS automáticamente!

---

## ⚡ Parámetros soportados (compatibles con KapChat)

| Parámetro | Valores | Descripción |
| :--- | :--- | :--- |
| `channel` | Nombre de usuario de Twitch | Canal al que conectarse (ej. `carola`, `ibai`). |
| `style` | `simple`, `custom1`, `custom2`, o cualquier carpeta en `chat-styles/` | Estilo visual cargado dinámicamente. |
| `fade` | `false`, `true` o segundos (ej. `30`) | Desvanecer mensajes tras X segundos. |
| `bot_activity` | `false` o `true` | Si es `false`, oculta comandos `!` y bots. |
| `prevent_clipping` | `false` o `true` | Evita que los mensajes se corten al pie del lienzo. |
| `overlay` | `true` | Modo transparente puro para OBS Studio sin controles. |

### Ejemplo de URL idéntica para OBS:
```text
https://tu-dominio/?channel=carola&style=simple&fade=false&bot_activity=false&prevent_clipping=false&overlay=true
```

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 📄 Licencia

Distribuido bajo la licencia [MIT](LICENSE).
