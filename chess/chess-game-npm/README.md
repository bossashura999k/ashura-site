# Online Chess (npm version)

A private two-player online chess game. Two fixed users log in and play head-to-head on a shared board, with optional Fischer-style chess clocks.

## Requirements

- **Node.js 20+** (24 recommended). Check with `node -v`.
- **npm 10+** (ships with modern Node).

## One-time setup

From this folder:

```bash
npm install
```

This installs dependencies for the web app, the API server, and the shared workspace packages — all via standard npm workspaces (no pnpm required).

## Run the game

```bash
npm run dev
```

That starts both servers in one terminal:

- **API server** at <http://localhost:8080> (label `SERVER`)
- **Web app** at <http://localhost:5173> (label `WEB`) — open this in your browser.

The web app proxies `/api/*` to the API server automatically, so you only ever visit the `:5173` URL.

To stop, press `Ctrl+C`.

## Login credentials

Two players, fixed colors:

| Color | Username | Password   |
| ----- | -------- | ---------- |
| White | `white`  | `white123` |
| Black | `black`  | `black123` |

Open two browser windows (or different browsers / devices on the same network) — log in as one each.

### Playing across the network

By default the servers bind to `localhost`. To play with a friend on another machine, run:

```bash
HOST=0.0.0.0 npm run dev
```

…and have them browse to `http://<your-LAN-IP>:5173`. (On Windows PowerShell use `$env:HOST="0.0.0.0"; npm run dev`.)

For internet play, expose port `5173` with a tunnel like ngrok: `ngrok http 5173`.

## Project layout

```
chess-game/
├── apps/
│   ├── web/        # React + Vite frontend (port 5173)
│   └── server/     # Express API + chess.js engine (port 8080)
└── packages/
    ├── api-client-react/  # Generated React Query hooks for the API
    └── api-zod/           # Generated Zod schemas for request/response bodies
```

## Useful commands

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Run both servers (recommended)    |
| `npm run dev:web`  | Run only the web app              |
| `npm run dev:server` | Run only the API server         |
| `npm run build`    | Production build (web + server)   |
| `npm run start`    | Run the production server build   |
| `npm run typecheck`| TypeScript check across the repo  |

## Optional environment variables

| Var          | Default     | Used by | Purpose                      |
| ------------ | ----------- | ------- | ---------------------------- |
| `PORT`       | `8080`      | server  | API server port              |
| `WEB_PORT`   | `5173`      | web     | Vite dev server port         |
| `HOST`       | `localhost` | web     | Vite host (use `0.0.0.0` for LAN) |
| `SESSION_SECRET` | random  | server  | Session cookie secret        |
| `LOG_LEVEL`  | `info`      | server  | Pino log level               |
