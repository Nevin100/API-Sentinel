# API Sentinel — Backend

FastAPI service: endpoint monitoring worker, Postman-lite request sender, deep network inspect, dashboard stats, Discord alerts, live system stats, and Prometheus metrics.

## Setup (Windows / PowerShell)

```powershell
cd backend
uv venv
.\.venv\Scripts\Activate.ps1
uv pip install -r requirements.txt

# infra (from project root)
docker compose up -d postgres redis

# run
uvicorn app.main:app --reload
```

- Interactive docs → http://localhost:8000/docs
- Prometheus metrics → http://localhost:8000/metrics

## Layout

```
app/
├── main.py               # app factory, CORS, router wiring, scheduler lifespan
├── core/config.py        # settings loaded from .env
├── db/session.py         # SQLAlchemy engine + session
├── models/models.py      # Endpoint, CheckResult, RequestLog,
│                         #   Collection, SavedRequest, Environment
├── api/routes/
│   ├── endpoints.py      # endpoint CRUD, pause/resume toggle, delete, results
│   ├── requests.py       # manual send + request logs
│   ├── inspect.py        # deep inspect endpoint
│   ├── collections.py    # collections, saved requests, environments
│   ├── stats.py          # dashboard aggregations
│   └── system.py         # live host stats (CPU/RAM/disk via psutil)
├── services/
│   ├── sender.py         # httpx request execution
│   ├── variables.py      # {{variable}} substitution from active environment
│   ├── inspector.py      # DNS → TCP → TLS → TTFB waterfall + cert info
│   ├── alerts.py         # Discord webhook alerts
│   └── metrics.py        # Prometheus counters/gauges/histograms
└── worker/scheduler.py   # APScheduler: run_checks() every interval
```

## How monitoring works

`worker/scheduler.py::run_checks()` runs every `CHECK_INTERVAL_SECONDS`:

1. Loads all active endpoints
2. Hits each one, recording status code + latency
3. Inserts a `CheckResult` row
4. On failure: `consecutive_failures += 1` → hits `ALERT_THRESHOLD` → one Discord alert (no repeats until recovery)
5. On success: resets the counters, sends a recovery note if one was down
6. Updates the Prometheus metrics

## API reference

| Method | Path | What |
|---|---|---|
| GET / POST | `/api/endpoints` | List / create monitored endpoints |
| GET | `/api/endpoints/{id}/results` | Check history |
| PATCH | `/api/endpoints/{id}/toggle` | Pause / resume monitoring |
| DELETE | `/api/endpoints/{id}` | Remove endpoint |
| POST | `/api/requests/send` | Send a manual request (auto-logged) |
| GET | `/api/requests/logs` | Manual request log |
| POST | `/api/inspect/deep` | Deep inspect: waterfall + DNS + TLS |
| GET / POST | `/api/collections` | Collections |
| POST | `/api/collections/{id}/requests` | Save a request |
| POST | `/api/requests/{id}/send` | Send saved request (env vars resolved) |
| GET / POST | `/api/environments` | Environments |
| POST | `/api/environments/{id}/activate` | Set active environment |
| GET | `/api/stats/summary` | Dashboard cards |
| GET | `/api/stats/failures` | Recent failures feed |
| GET | `/api/stats/endpoints/{id}` | Uptime + latency percentiles |
| GET | `/api/stats/endpoints/{id}/daily` | Daily heatmap buckets |
| GET | `/api/system/stats` | Live CPU / RAM / disk |

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | Postgres | `postgresql://sentinel:sentinel@localhost:5432/sentinel` |
| `REDIS_URL` | Redis | `redis://localhost:6379/0` |
| `CHECK_INTERVAL_SECONDS` | Monitoring interval | `300` |
| `ALERT_WEBHOOK_URL` | Discord webhook | _(empty = disabled)_ |
| `ALERT_THRESHOLD` | Failures before alert | `3` |

## Notes

- `Base.metadata.create_all()` creates missing **tables** but never alters them — new columns need a manual `ALTER TABLE`.
- `/metrics` stays unauthenticated by design so Prometheus can scrape it.
- Never commit `.env` — webhook URLs are secrets.
