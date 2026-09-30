# API Sentinel — Frontend

Next.js 16 dashboard for API Sentinel: monitoring overview, endpoint management, Postman-lite tester, collections, deep inspect, and live system stats.

## Setup (Windows / PowerShell)

```powershell
cd frontend
npm install
npm run dev
```

App → http://localhost:3000

Backend URL comes from `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Pages

| Route | What |
|---|---|
| `/` | Dashboard — summary cards, endpoint cards, recent failures, live system stats |
| `/endpoints` | Monitored endpoints: add, pause/resume, delete |
| `/endpoints/[id]` | Per-endpoint detail: uptime, p50/p95/p99 latency, daily heatmap, check history |
| `/tester` | Postman-lite: method/URL/headers/body, response viewer, request log |
| `/collections` | Collections, saved requests, environments with `{{variables}}` |
| `/inspect` | Deep inspect: DNS → TCP → TLS → TTFB waterfall + certificate info |

## Conventions

- **All backend calls go through `src/lib/api.ts`** — one `req()` helper plus a typed method per endpoint. Pages never call `fetch` directly.
- **Shared UI** lives in `src/components/` — `ui.tsx` (Navbar, Footer, buttons, cards), `charts.tsx` (latency bars, heatmap), `EndpointCard.tsx`, `SystemStats.tsx` (live CPU/RAM/disk).
- **Dark theme** via Tailwind utility classes (zinc palette).
- New backend route? Add one method in `src/lib/api.ts`, then use it from the page.

## Build

```powershell
npm run build
npm start
```
