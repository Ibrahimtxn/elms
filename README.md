# ELMS — Phase 1: Backend & Frontend Foundation

Federal University Dutse E-Learning Management System.
This phase sets up the skeleton only — no auth, no real data yet.
Goal: prove backend and frontend boot, connect to Postgres, and talk to each other.

## Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: set DATABASE_URL to a real Postgres instance you have running,
# e.g. postgresql+psycopg2://elms_user:elms_password@localhost:5432/elms_db

uvicorn app.main:app --reload
```

Then check:
- http://localhost:8000/docs — interactive API docs (Swagger UI)
- http://localhost:8000/api/v1/health — should return `{"status": "ok", ...}` if Postgres is reachable

Run tests:
```bash
pytest
```

## Frontend (React + Vite + TypeScript)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 — you should see:
- A "Dashboard" page at `/`
- A "System Status" page at `/status` that calls the backend's `/health`
  endpoint and shows whether the API and database are reachable

## What to test before we move to Phase 2 (Authentication)

1. Backend starts with no errors: `uvicorn app.main:app --reload`
2. `/api/v1/health` returns `status: "ok"` with your Postgres running
3. `/api/v1/health` returns `status: "degraded"` if you stop Postgres
   (proves error handling works, not just the happy path)
4. `pytest` passes in `backend/`
5. Frontend starts: `npm run dev`
6. Sidebar navigation switches between Dashboard and System Status
7. System Status page shows live data from the backend (not a hardcoded value)
8. Stopping the backend and refreshing `/status` shows the ErrorState
   component with a "Try again" button — not a blank page or crash

Once all of that checks out on your machine, tell me and we'll move to
**Phase 2 — Authentication**.

## Project structure

```
elms/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py      # env-driven settings
│   │   │   ├── logging.py
│   │   │   └── errors.py      # standardized error responses
│   │   ├── db/
│   │   │   ├── session.py     # engine, SessionLocal, get_db()
│   │   │   └── base.py        # SQLAlchemy declarative base
│   │   └── api/v1/
│   │       ├── health.py
│   │       └── router.py
│   ├── alembic/                # migrations (empty until Sprint 2+ models exist)
│   ├── tests/
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/                # axios client + typed API calls
    │   ├── components/         # LoadingState, ErrorState, ErrorBoundary
    │   ├── layouts/            # MainLayout (sidebar + nav)
    │   ├── pages/               # DashboardPage, StatusPage, NotFoundPage
    │   └── routes/              # AppRoutes
    └── package.json
```
