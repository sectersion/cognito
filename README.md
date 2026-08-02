# Cognito

A browser-based WebOS with a Scramjet-powered web proxy, game library, and macOS-inspired desktop shell.

## Features

- **Desktop environment** — windowed desktop with drag, resize, snap, maximize, minimize
- **Web browser** — Safari-style tabbed browser with Scramjet proxy for private browsing
- **Game library** — 80+ browser-based games in a Steam-style interface
- **App launcher** — Launchpad-style grid with search, categories, and dock pinning
- **Music player** — Now-playing overlay with media controls
- **Settings** — 8-section settings panel (General, Appearance, Dock, Browser, Privacy, Network, Notifications, About)
- **Privacy** — about:blank cloaking, blob URL cloaking, DNS over 1.1.1.3
- **Notifications** — slide-out notification center with dismiss and clear-all

## Getting Started

### Prerequisites

- Node.js >= 16
- npm >= 7

### Installation

```bash
git clone <repo-url> cognito
cd cognito
npm install
```

### Development

Run both frontend and backend in parallel:

```bash
npm run dev:all
```

- Frontend (Vite): http://localhost:5173
- Backend (Fastify): http://localhost:8080

For frontend only:

```bash
npm run dev:frontend
```

### Production

```bash
npm start
```

This builds the frontend and starts the Fastify server on port 8080 (or the `PORT` environment variable).

### Docker

```bash
docker compose up
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Run frontend + backend in parallel |
| `npm run dev:frontend` | Run Vite dev server only |
| `npm run dev` | Run backend with nodemon |
| `npm start` | Build frontend and start production server |
| `npm run build:frontend` | Build frontend for production |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Lint with ESLint |

## Tech Stack

- **Frontend:** React 19, Zustand, Vite
- **Backend:** Fastify, WISP, Scramjet, BareMux, Libcurl
- **Styling:** CSS with glass morphism effects
- **Deployment:** Docker (node:18-alpine)

## License

[AGPL-3.0](LICENSE)
