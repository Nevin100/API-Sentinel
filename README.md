# API Sentinel 🛰️

**Monitor, test, and X-ray your APIs — from one dashboard.**

<img width="1364" height="689" alt="image" src="https://github.com/user-attachments/assets/fb3e80f7-e81c-4e35-86cb-f8fca4051c93" />

API Sentinel is a full-stack API monitoring and debugging platform: uptime checks, a Postman-lite request tester, deep network inspection (DNS → TCP → TLS → TTFB waterfall), collections with environments, Discord downtime alerts, live system stats, and Prometheus metrics.

> Summer project — FastAPI + Next.js + PostgreSQL + Redis, containerized with Docker.

## ✨ Features

- **Uptime monitoring** — APScheduler hits your endpoints on a fixed interval and stores every check
- **Dashboard** — 24h uptime %, p50/p95/p99 latency, daily heatmap, live failure feed
- **Postman-lite tester** — send any HTTP request, inspect status/body/timing; every send is logged
- **Deep Inspect** — per-phase network timing waterfall + SSL certificate details
- **Collections & environments** — save requests, `{{variable}}` substitution per active environment
- **Discord alerts** — fires after N consecutive failures, auto-resolves on recovery
- **System stats** — live CPU / RAM / disk of the host machine
- **Prometheus metrics** — `/metrics` exposes checks, latency histogram, and per-endpoint up/down gauge

## 🏗️ Architecture

```
Browser  (Next.js :3000)
   │  REST + CORS
   ▼
FastAPI  (:8000) ──► PostgreSQL  (endpoints, checks, logs, collections)
   │                 Redis       (cache / future queues)
   ├── APScheduler ──► periodic checks ──► Discord webhook on failures
   └── /metrics ──► Prometheus ──► Grafana
```

## 🚀 Quick start

### Option 1 — Docker (recommended)

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend docs → http://localhost:8000/docs

### Option 2 — Local dev (Windows / PowerShell)

```powershell
# infra (from project root)
docker compose up -d postgres redis

# backend
cd backend
.\.venv\Scripts\Activate.ps1
uv pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

> Existing databases need the alert columns once (new tables are auto-created, new columns are not):
```sql
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS alert_sent BOOLEAN DEFAULT FALSE;
```

## ⚙️ Configuration

| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | Postgres connection | `postgresql://sentinel:sentinel@localhost:5432/sentinel` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379/0` |
| `CHECK_INTERVAL_SECONDS` | Seconds between monitoring rounds | `300` |
| `ALERT_WEBHOOK_URL` | Discord webhook for down alerts | _(empty = disabled)_ |
| `ALERT_THRESHOLD` | Consecutive failures before alerting | `3` |

## 📡 API overview

| Area | Example routes |
|---|---|
| Endpoints | `GET/POST /api/endpoints`, `PATCH /api/endpoints/{id}/toggle`, `DELETE /api/endpoints/{id}` |
| Check history | `GET /api/endpoints/{id}/results` |
| Tester | `POST /api/requests/send`, `GET /api/requests/logs` |
| Deep inspect | `POST /api/inspect/deep` |
| Collections | `GET/POST /api/collections`, `GET/POST /api/environments`, `POST /api/requests/{id}/send` |
| Stats | `GET /api/stats/summary`, `/api/stats/failures`, `/api/stats/endpoints/{id}`, `/api/stats/endpoints/{id}/daily` |
| System | `GET /api/system/stats` |

Interactive docs: http://localhost:8000/docs

## 📊 Prometheus metrics

| Metric | Type | What |
|---|---|---|
| `sentinel_checks_total` | Counter | Monitoring checks run, labeled by endpoint/status |
| `sentinel_check_latency_seconds` | Histogram | Check latency distribution |
| `sentinel_endpoint_up` | Gauge | 1/0 per endpoint |
| `sentinel_requests_sent_total` | Counter | Manual tester sends |

## 📁 Structure

```
api_sentinel/
├── backend/                 # FastAPI app → see backend/README.md
├── frontend/                # Next.js app → see frontend/README.md
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 🗺️ Roadmap

- API-key authentication
- Grafana dashboards + Docker container stats
- OAuth2 flows, OpenAPI import, public status page

## 📄 License

MIT
